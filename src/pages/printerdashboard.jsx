import {
  ArrowRightOnRectangleIcon,
  BoltIcon,
  CheckIcon,
  CheckCircleIcon,
  PowerIcon,
  PaperAirplaneIcon,
  CloudArrowUpIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  WrenchIcon,
  ArrowSmallDownIcon,
  ArrowSmallUpIcon,
  CogIcon,
  PrinterIcon,
  PauseIcon,
  RocketLaunchIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CircleStackIcon,
  ArrowUpTrayIcon,
  PlayCircleIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Menu, Transition, Dialog } from "@headlessui/react";
import React, { useState, useEffect, Fragment } from "react";
import NavBar from "../components/navigation";
import avatar from "../assets/images/avatar4.jpeg";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
// import {
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   XAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   YAxis,
//   // ReversedRechartsProvider
// } from "recharts";
import "line-chart-react/dist/index.css";
import app_api, { details_api } from "../config/config";
import { useParams } from "react-router-dom";
import Printers from "./printers";
import "./printerdashboard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ApexCharts from "apexcharts";
import Chart from "react-apexcharts";
// import { ArrowTrendingUpIcon } from "@heroicons/react/outline";
import { socket } from "../socket";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ONE_SECOND = 1000;
const INTERVAL = ONE_SECOND;

const Dashboard = () => {
  const [postId, setPostId] = useState("");
  const [printer, setPrinter] = useState({});
  const [printerDetails, setPrinterDetails] = useState({});
  const [configuration, setConfiguration] = useState([]);
  const [jobcontrol, setJobControl] = useState("print");
  const { printerid } = useParams();
  const [uploadfiles, setUploadFiles] = useState(false);
  const [file, setFile] = useState(null);
  const [detailInterval, setDetailInterval] = useState(null);

  const [printFile, setPrintFile] = useState("");

  const [loadedFiles, setLoadedFiles] = useState([]);

  const [tempStats, setTempStats] = useState([]);

  const [streamData, setStreamData] = useState("some");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filamentData, setFilamentData] = useState([]);
  const [heatersData, setHeatersData] = useState([]);
  const [hoverData, setHoverData] = useState(null);

  useEffect(() => {
    app_api
      .get(`printer/token/${printerid}`)
      .then((res) => res.data)
      .then((res) => {
        setPrinter(res);
        app_api
          .post("printer-config/by/printer", { id: res?.printerConfigId })
          .then((res) => res.data)
          .then((res) => setConfiguration(res?.Configuration))
          .catch((err) => {});
      })
      .catch((err) => {});
    getPrinterDetails();
    setDetailInterval(
      setInterval(() => {
        getPrinterDetails();
        getJobs();
      }, INTERVAL)
    );
    viewPrinter();
    getFileList();
    getJobs();
    app_api
      .get("file")
      .then((res) => res.data)
      .then((res) => {
        setFiles(res);
      })
      .catch((err) => {});
    socket.connect("/");
    socket.on(`stream:${printerid}`, (data) => {
      setStreamData(data);
    });
    return () => {
      clearInterval(detailInterval);
      quitViewPrinter();
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    configuration.map((config) => {
      if (
        config.htmlElement !== "button_group" &&
        config.htmlElement !== "array" &&
        config.htmlElement !== "selfArray"
      ) {
        let button = document.getElementById(config.name);
        if (button) {
          if (config.text) button.textContent = config.text;
          button.setAttribute("data-gcode", config.command);
          button.addEventListener("click", function (ev) {
            let htmlElement = config.htmlElement,
              error = false;
            let finalCommand = `${ev.currentTarget?.getAttribute(
              "data-gcode"
            )}`;
            let exp = new RegExp(/{{.+?}}/g);
            let placeholders = finalCommand.match(exp);
            if (placeholders && placeholders.length > 0) {
              placeholders = placeholders.map((r) => {
                let str = r;
                str = str.replace(/^{{/, "");
                str = str.replace(/}}+$/, "");
                return str;
              });
              placeholders.forEach((p) => {
                if (htmlElement !== "radio") {
                  let input = document.getElementById(`${button?.id}_input`);
                  if (input && input.value) {
                    finalCommand = finalCommand.replace(
                      `{{${p}}}`,
                      input.value
                    );
                  } else {
                    error = true;
                  }
                } else {
                  let inputs = document.getElementsByName(p);
                  let value = "";
                  for (var i = 0; i < inputs.length; i++) {
                    if (inputs[i].checked) {
                      value = inputs[i].value;
                    }
                  }
                  if (value)
                    finalCommand = finalCommand.replace(`{{${p}}}`, value);
                  else error = true;
                }
              });
            }
            if (error) alert("Some value(s) are missing");
            else onSendCommand(finalCommand);
          });
        }
      } else if (config.htmlElement === "button_group") {
        let buttons = document.getElementsByClassName(config.name);
        for (var i = 0; i < buttons.length; i++) {
          let button = buttons[i];
          button.setAttribute("data-gcode", config.command);
          button.addEventListener("click", (ev) => {
            let finalCommand = ev.currentTarget.getAttribute("data-gcode");
            let exp = new RegExp(/{{.+?}}/g);
            let placeholders = finalCommand.match(exp);
            if (placeholders && placeholders.length > 0) {
              placeholders.forEach((p) => {
                finalCommand = finalCommand.replace(
                  p,
                  ev.currentTarget.textContent
                );
              });
            }
            onSendCommand(finalCommand);
          });
        }
      } else if (config.htmlElement === "array") {
        let buttons = document.getElementsByClassName(config.name);
        for (var i = 0; i < buttons.length; i++) {
          let button = buttons[i],
            error = false;
          if (config.text) button.textContent = config.text;
          button.setAttribute("data-gcode", config.command);
          button.setAttribute("data-index", i);
          button.addEventListener("click", (ev) => {
            let configuration = config;
            let finalCommand = ev.currentTarget.getAttribute("data-gcode");
            let exp = new RegExp(/{{.+?}}/g);
            let placeholders = finalCommand.match(exp);
            if (placeholders && placeholders.length > 0) {
              placeholders.forEach((p) => {
                if (p === "{{index}}") {
                  finalCommand = finalCommand.replace(
                    p,
                    ev.currentTarget.getAttribute("data-index")
                  );
                } else {
                  let input = document.getElementById(
                    `${configuration.name}_${ev.currentTarget.getAttribute(
                      "data-index"
                    )}_input`
                  );
                  if (input && input.value) {
                    finalCommand = finalCommand.replace(p, input.value);
                  } else {
                    error = true;
                  }
                }
              });
            }
            if (error) alert("Some value(s) are missing");
            else onSendCommand(finalCommand);
          });
        }
      } else if (config.htmlElement === "selfArray") {
        if (config.name === "movement") {
          let positiveDiv = document.getElementsByClassName("movement");
          let negativeDiv =
            document.getElementsByClassName("movement-negative");
          for (var i = 0; i <= 2; i++) {
            let pDiv = positiveDiv[i];
            pDiv.innerHTML = "";
            let nDiv = negativeDiv[i];
            nDiv.innerHTML = "";
          }
          let incrementalArray = Array.from(config.selfArray);
          let descrementalArray = Array.from(config.selfArray).sort(
            (a, b) => b - a
          );
          for (var i = 0; i <= 2; i++) {
            incrementalArray.map((num) => {
              let button = document.createElement("button");
              if (i === 0) {
                button.classList.add("move_x");
                button.textContent = num;
              } else if (i === 1) {
                button.classList.add("move_y");
                button.textContent = num;
              } else if (i === 2) {
                button.classList.add("move_z");
                button.textContent = num;
              }
              let div = positiveDiv[i];
              div.appendChild(button);
            });
            descrementalArray.map((num) => {
              let button = document.createElement("button");
              if (i === 0) {
                button.classList.add("move_x");
                button.textContent = -num;
              } else if (i === 1) {
                button.classList.add("move_y");
                button.textContent = -num;
              } else if (i === 2) {
                button.classList.add("move_z");
                button.textContent = -num;
              }
              let div = negativeDiv[i];
              div.appendChild(button);
            });
          }
        } else if (config.name === "feedrate" || config.name === "feedamount") {
          const div = document.getElementById(config.name);
          config.selfArray.forEach((num) => {
            let label = document.createElement("label");
            label.classList.add("flex", "flex-col", "border-r", "p-2");
            label.name = config.name;
            let input = document.createElement("input");
            input.type = "radio";
            input.value = num;
            input.name = config.name;
            let span = document.createElement("span");
            span.classList.add("radio-label", "mt-2");
            span.textContent = num;

            label.appendChild(input);
            label.appendChild(span);
            // div.appendChild(input);
            div.appendChild(label);
          });
        }
      }
    });
  }, [configuration]);

  const getPrinterDetails = () => {
    details_api
      .get(`printer-details/${printerid}`)
      .then((res) => {
        setPrinterDetails(res.data);
        ApexCharts.exec("apex_layerChart", "updateSeries", [
          {
            name: "Layer",
            data: getLayerData(res.data),
          },
        ]);
      })
      .catch((err) => {});
  };

  useEffect(() => {
    let statsForTemp = Array.from(tempStats);
    printerDetails.heat?.heaters?.forEach((temp, idx) => {
      if (
        Array.isArray(statsForTemp) &&
        statsForTemp.length > idx &&
        "data" in statsForTemp[idx] &&
        Array.isArray(statsForTemp[idx]["data"])
      ) {
        while (statsForTemp[idx]["data"].length > 30) {
          statsForTemp[idx]["data"].shift();
        }
        statsForTemp[idx]["data"]?.push({
          x: Date.now(),
          y: temp?.current,
        });
      } else {
        statsForTemp[idx] = {
          name: `Heater ${idx}`,
          data: [
            {
              x: Date.now(),
              y: temp?.current,
            },
          ],
        };
      }
    });
    ApexCharts.exec("apex_tempChart", "updateSeries", statsForTemp);
    setTempStats(statsForTemp);
  }, [printerDetails]);

  // TODO: upload and start in a single job request
  const getJobs = () => {
    details_api
      .get(`jobs/printer/${printerid}`)
      .then((res) => res.data)
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          for (const job of res) {
            if (job?.type === "list_file") {
              let filesStr = job?.response;
              filesStr = filesStr.slice(13);
              let files = filesStr.split(",").map((f) => {
                let name = f.slice(1);
                name = name.substring(0, name.length - 1);
                return name;
              });
              setLoadedFiles(files);
            } else {
              toast.info(job?.response);
            }
          }
        }
      })
      .catch((err) => {});
  };

  const getFileList = () => {
    app_api
      .post("job/list-file", { printerToken: printerid })
      .then((res) => {})
      .catch((err) => {});
  };

  const viewPrinter = () => {
    app_api
      .post("job/view-printer", { printerToken: printerid })
      .then((res) => {})
      .catch((err) => {});
  };

  const quitViewPrinter = () => {
    app_api
      .post("job/quit-view-printer", { printerToken: printerid })
      .then((res) => {})
      .catch((err) => {});
  };

  const onSendCommand = (command) => {
    // console.log({ command });
    app_api
      .post("job", {
        printerToken: printerid,
        ownerId: printer?.ownerId,
        command,
      })
      .then((res) => {})
      .catch((err) => {});
  };

  const uploadFiles = () => {
    let values_form_data = new FormData();
    // Object.keys(values).forEach((key) => {
    //   if (!!values[key]) values_form_data.append(key, values[key]);
    // });
    // values_form_data.append("file", currentTarget.files[0]);
    app_api.post("files", values_form_data).then((res) => {
      // console.log(res.json);
      // console.log("uploaded");
    });
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    app_api
      .post("file", formData)
      .then((res) => {
        alert("File uploaded");
        onSendCommand(`V120 ${res.data?.filePath}`);
        setUploadFiles(false);
      })
      .catch((err) => {
        alert(err);
      });
  };

  const data = [
    { label: " 0", "Expected Point": 23, "Obtain Point": 122 },
    { label: " 1", "Expected Point": 3, "Obtain Point": 73 },
    { label: " 2", "Expected Point": 15, "Obtain Point": 32 },
    { label: " 3", "Expected Point": 35, "Obtain Point": 23 },
    { label: " 4", "Expected Point": 25, "Obtain Point": 15 },
    { label: " 4", "Expected Point": 15, "Obtain Point": 9 },
    { label: " 4", "Expected Point": 45, "Obtain Point": 20 },
  ];

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // useEffect(() => {
  //   app_api
  //     .get(`${printerid}/heat`)
  //     .then((response) => {
  //       const data = response.data;
  //       console.log(data);
  //       setChartData(data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }, []);

  useEffect(() => {
    // Fetch initial data

    const initialData = printerDetails?.heat?.heaters || [];
    setHeatersData(initialData);

    const initialLayersData = printerDetails?.job?.layers || [];
    setFilamentData(initialLayersData);

    // Refresh data every 5 seconds
    const intervalId = setInterval(() => {
      const newData = printerDetails?.heat?.heaters || [];
      setHeatersData(newData);
    }, INTERVAL);

    const intervalLayer = setInterval(() => {
      const newlayersData = printerDetails?.job?.layers || [];
      setFilamentData(newlayersData);
    }, INTERVAL);
    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
      clearInterval(intervalLayer);
    };
  }, [printerDetails]);

  const getLineColor = (index) => {
    // Replace this with your desired logic to assign colors to different lines
    const colors = ["#FF0000", "#00FF00", "#0000FF"];
    return colors[index % colors.length];
  };

  const handleMouseOver = (datapoint) => {
    setHoverData(datapoint);
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  const getLayerData = (printerDetails) =>
    printerDetails?.job?.layers
      ?.slice(Math.max(printerDetails?.job?.layers.length - 100, 0))
      .map((l, idx) => ({
        x: idx + Math.max(printerDetails?.job?.layers.length - 100, 0),
        y: l?.filament[0],
      })) || [];

  return (
    <div className="flex flex-row">
      <div className="hidden xs:hidden lg:block md:block">
        <NavBar />
      </div>

      <div className="py-4 px-12 pt-6 xs:ml-[0em]  w-full">
        <div className="md:flex justify-center items-center">
          <div className="md:w-6/12 text-start flex">
            <Formik
              initialValues={{ command: "" }}
              onSubmit={(values, { resetForm }) => {
                onSendCommand(values.command);
                resetForm();
              }}
            >
              {({
                handleBlur,
                handleChange,
                handleSubmit,
                values,
                touched,
                errors,
              }) => (
                <form className="w-full" noValidate onSubmit={handleSubmit}>
                  <label
                    htmlFor="default-search"
                    className="mb-2 text-sm font-medium text-gray-900 sr-only "
                  >
                    Search
                  </label>
                  <div className="relative w-100">
                    <div className="w-12/12  inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>

                    <input
                      name="command"
                      type="text"
                      className="block w-full p-2 pl-3 text-sm text-gray-900 border rounded-lg bg-gray-50"
                      placeholder="Send command"
                      required
                      value={values.command}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <button
                      type="submit"
                      className="flex text-gray-500 absolute right-0 bottom-[1px] focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2"
                    >
                      <PaperAirplaneIcon className="w-5 text-black mr-1" />
                      Send
                    </button>
                  </div>
                </form>
              )}
            </Formik>
          </div>
          <div className="w-6/12 text-end flex md:justify-end md:items-center mt-5 md:mt-0 lg:mt-0">
            {/* <button
              type="button"
              onClick={() => setUploadFiles(true)}
              className="flex mr-1 py-2 px-5  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
            >
              <CloudArrowUpIcon className="w-5 mr-2" />
              Upload
            </button> */}
            {loadedFiles.length > 0 ? (
              <select
                id="start_print_input"
                value={printFile}
                onChange={(e) => setPrintFile(e.target.value)}
              >
                {loadedFiles.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-muted mr-4">No loaded file</span>
            )}
            <button
              id="start_print"
              type="button"
              className="flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
            >
              Start
            </button>
            {/* <button
              type="button"
              id="emergency_stop"
              className="text-white bg-[#FFA200] hover:bg-blue-800 focus:ring-4 focus:ring-blue-300  rounded-lg text-sm px-5 py-2 mr-2  focus:outline-none "
            >
              Emergency stop
            </button> */}
          </div>
        </div>

        <div className="lg:flex justify-between mt-10 ">
          <div className="rounded-lg border lg:w-4/12 shadow-md relative">
            <div className="flex justify-between px-3 pb-0 pt-3 font-semibold">
              <p className="flex ">
                <InformationCircleIcon className="w-5" /> Status
              </p>
              <p
                className={`capitalize rounded px-2 py-1 text-xs font-semibold shadow-sm ${
                  ["disconnected", "off", "cancelling"].includes(
                    printerDetails?.state?.status
                  )
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : ["updating", "halted", "pausing", "busy"].includes(
                        printerDetails?.state?.status
                      )
                    ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                    : ["paused", "resuming"].includes(
                        printerDetails?.state?.status
                      )
                    ? "bg-yellow-200 text-yellow-600 hover:bg-yellow-100"
                    : ["starting", "processing"].includes(
                        printerDetails?.state?.status
                      )
                    ? "bg-green-50 text-green-600 hover:bg-green-100"
                    : ["simulating", "idle", "changingTool"].includes(
                        printerDetails?.state?.status
                      )
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                {printerDetails?.state?.status}
              </p>
            </div>
            <hr className="mt-3 "></hr>
            <div className="flex justify-between mt-3 p-3">
              <p className="flex text-gray-600 text-sm">Total Position</p>
              {printerDetails?.move?.axes?.map((axis, idx) => (
                <p key={idx} className="text-sm text-gray-600">
                  {axis?.letter || "N/A"}: {axis?.machinePosition || "N/A"}
                </p>
              ))}
            </div>
            <hr className="mt-3"></hr>
            <div className="flex justify-between mt-3 px-3">
              <p className="flex text-gray-600 text-sm">Extruder Drives</p>
              {printerDetails?.move?.extruders?.map((ex, idx) => (
                <p key={idx} className="text-sm text-gray-600">
                  Drive {idx}
                  <br></br>
                  {ex?.position || "N/A"}
                </p>
              ))}
            </div>
            <hr className="mt-3"></hr>
            <div className="flex justify-between mt-3 px-3 mb-3">
              <p className="flex text-gray-600 text-sm">Speeds</p>
              <p className="text-sm text-gray-600 text-end">
                Requested speed:{" "}
                {printerDetails?.move?.currentMove?.requestedSpeed.toString() ||
                  "N/A"}
                mm/s
                <br></br>
                Top Speed:{" "}
                {printerDetails?.move?.currentMove?.topSpeed.toString() ||
                  "N/A"}
                mm/s
              </p>
            </div>
            <hr className="mt-3"></hr>
            <div className="flex justify-between mt-3 px-3 mb-3">
              <p className="flex text-gray-600 text-sm">
                Total energy consumption
              </p>
              <p className="text-sm text-gray-600 text-end">
                {printerDetails?.electricity?.energy_Wh || "N/A"}Wh
              </p>
            </div>
            <div className="flex justify-end p-3 bg-gray-200 absolute bottom-0 w-[100%]">
              <button
                type="button"
                id="get_firmware_details"
                className="flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
              >
                Get firmware details
              </button>
              <button
                type="button"
                className="flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
              >
                <ArrowPathIcon className="w-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          <div className="lg:w-[37%] rounded-lg border shadow-md relative mt-10 lg:mt-0">
            <div className="relative   sm:rounded-lg">
              <h2 className="flex p-3 font-semibold">
                <WrenchIcon className="w-5 mr-2 " />
                Tools + Extra
              </h2>
              <div className="w-full overflow-x-auto ">
                <table className="w-full text-sm text-left text-gray-500  ">
                  <thead className="text-xs text-gray-700 uppercase ">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Heater
                      </th>
                      <th scope="col" className="px-6 py-3 bg-gray-50 ">
                        Current
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Active
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Standby
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {printerDetails?.heat?.heaters?.map((h, index) => {
                      return (
                        <tr key={index} className="border-b border-gray-200 ">
                          <td className="px-6 py-4 text-red-500 text-center">
                            Heater {index}
                          </td>
                          <td className="px-6 py-4 bg-gray-50 text-center">
                            {h?.current}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="number"
                              min="0"
                              placeholder={h?.active}
                              id={`temperature_active_${index}_input`}
                              className=" border w-[60px] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2 text-center inline-flex items-center"
                            />
                            <button
                              type="button"
                              className="bg-[#FFA200] hover:bg-[#f2ae38] leading-4 text-white rounded-lg mt-3 py-2 temperature_active"
                            ></button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="number"
                              min="0"
                              placeholder={h?.standby}
                              id={`temperature_standby_${index}_input`}
                              className="border w-[60px] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center"
                            />
                            <button
                              type="button"
                              className="bg-[#FFA200] hover:bg-[#f2ae38] leading-4 text-white rounded-lg mt-3 py-2 temperature_standby"
                            ></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="lg:w-3/12 mt-10 lg:mt-0 border rounded-lg pb-3 shadow-md">
            <h2 className="flex p-3 font-semibold">
              <ArrowTrendingUpIcon className="w-5 mr-2" />
              Temperature chart
            </h2>
            <p className="text-gray-400 text-xs text-start pl-4 mb-5 font-light">
              Track your printer temperature chart.
            </p>
            <div className="w-full">
              <Chart
                options={{
                  chart: {
                    id: "apex_tempChart",
                    animations: {
                      enabled: true,
                      easing: "linear",
                      speed: 800,
                      animateGradually: {
                        enabled: true,
                        delay: 150,
                      },
                      dynamicAnimation: {
                        enabled: true,
                        speed: 350,
                      },
                    },
                    toolbar: {
                      show: false,
                    },
                    zoom: {
                      enabled: false,
                    },
                  },
                  dataLabels: {
                    enabled: false,
                  },
                  stroke: {
                    curve: "smooth",
                  },
                  markers: {
                    size: 0,
                  },
                  xaxis: {
                    type: "datetime",
                    range: 30000,
                  },
                  tooltip: {
                    x: {
                      format: "mm:ss",
                    },
                  },
                  legend: {
                    show: true,
                  },
                }}
                series={tempStats}
                type="line"
                height={350}
              />
            </div>
          </div>
        </div>

        <div className="lg:flex justify-between mt-10">
          <div className=" lg:w-8/12 mt-10 lg:mt-0 border  rounded-lg shadow-md p-3">
            <div className="flex justify-between w-full items-center">
              <div className="w-6/12">
                <h1 className="text-start font-semibold">Machine movement</h1>
              </div>
              <button
                type="button"
                id="home_all"
                className="flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
              >
                <CloudArrowUpIcon className="w-5 mr-2" />
                Home all
              </button>
            </div>
            <hr className="mt-3"></hr>
            <div className="flex justify-between items-center mt-3">
              <div className="flex justify-between border rounded-lg py-2 px-3 w-4/12 movement-negative">
                {/* <button className="move_x">-50</button>
                <button className="move_x">-10</button>
                <button className="move_x">-1</button>
                <button className="move_x">-0.1</button> */}
              </div>
              X
              <div className="flex justify-between border rounded-lg py-2 px-3 w-4/12 movement">
                {/* <button className="move_x">50</button>
                <button className="move_x">10</button>
                <button className="move_x">1</button>
                <button className="move_x">0.1</button> */}
              </div>
              <button
                type="button"
                id="home_x"
                style={{ backgroundColor: "#FFA200" }}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300  rounded-lg text-sm px-5 py-2 mr-2  focus:outline-none "
              >
                Home X
              </button>
            </div>
            <hr className="mt-3"></hr>
            <div className="flex justify-between items-center mt-3">
              <div className="flex justify-between border rounded-lg py-2 px-3 w-4/12 movement-negative">
                {/* <button className="move_y">-50</button>
                <button className="move_y">-10</button>
                <button className="move_y">-1</button>
                <button className="move_y">-0.1</button> */}
              </div>
              Y
              <div className="flex justify-between border rounded-lg py-2 px-3 w-4/12 movement">
                {/* <button className="move_y">50</button>
                <button className="move_y">10</button>
                <button className="move_y">1</button>
                <button className="move_y">0.1</button> */}
              </div>
              <button
                type="button"
                id="home_y"
                style={{ backgroundColor: "#FFA200" }}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300  rounded-lg text-sm px-5 py-2 mr-2  focus:outline-none "
              >
                Home Y
              </button>
            </div>
            <hr className="mt-3"></hr>
            <div className="flex justify-between items-center mt-3">
              <div className="flex justify-between border rounded-lg py-2 px-3 w-4/12 movement-negative">
                {/* <button className="move_z">-50</button>
                <button className="move_z">-10</button>
                <button className="move_z">-1</button>
                <button className="move_z">-0.1</button> */}
              </div>
              Z
              <div className="flex justify-between border rounded-lg py-2 px-3 w-4/12 movement">
                {/* <button className="move_z">50</button>
                <button className="move_z">10</button>
                <button className="move_z">1</button>
                <button className="move_z">0.1</button> */}
              </div>
              <button
                type="button"
                id="home_z"
                style={{ backgroundColor: "#FFA200" }}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300  rounded-lg text-sm px-5 py-2 mr-2  focus:outline-none "
              >
                Home Z
              </button>
            </div>
          </div>

          <div className="lg:w-[30%] mt-10 lg:mt-0 border overflow-x-auto rounded-lg pb-3 shadow-md">
            <h2 className="flex p-3 font-semibold">
              <CircleStackIcon className="w-5 mr-2 " />
              Live Streaming
            </h2>
            <p className="text-gray-400 text-xs text-start pl-4 mb-5  font-light">
              Track your printer in real-time
            </p>
            <div className="relative">
              {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="absolute inset-0 bg-black opacity-75"></div>
                  <div className="relative z-10">
                    <button
                      className="absolute top-4 right-4 text-white text-xl bg-red-600 p-2 shadow-md hover:bg-red-800"
                      onClick={closeModal}
                    >
                      <XMarkIcon className="w-5" />
                    </button>
                    <div className="bg-white p-4 w-[80vw] h-[80vh]">
                      <img src={`data:image/jpeg;base64, ${streamData}`} />
                    </div>
                  </div>
                </div>
              )}
              <div className="aspect-w-32 aspect-h-16">
                <img src={`data:image/jpeg;base64, ${streamData}`} />
              </div>
              <button
                className="absolute bottom-4 right-4 cursor-pointer hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={openModal}
              >
                <ArrowsPointingOutIcon className="w-5" />
              </button>
            </div>
          </div>
          <div className="lg:w-[29%] mt-10 lg:mt-0 border rounded-lg pb-3 shadow-md ">
            <h2 className="flex p-3 font-semibold">
              <ArrowTrendingUpIcon className="w-5 mr-2" />
              Layers chart
            </h2>
            <p className="text-gray-400 text-xs text-start pl-4 mb-5 font-light">
              Track your filament usage chart.
            </p>
            <div className="w-full overflow-x-auto">
              <Chart
                options={{
                  chart: {
                    id: "apex_layerChart",
                    toolbar: {
                      show: false,
                    },
                    zoom: {
                      enabled: false,
                    },
                  },
                  dataLabels: {
                    enabled: false,
                  },
                  tooltip: { enabled: false },
                  stroke: {
                    curve: "smooth",
                  },
                  markers: {
                    size: 0,
                  },
                  xaxis: {
                    type: "numeric",
                    labels: { formatter: (val, idx) => parseInt(val) },
                    title: "Layer",
                  },
                  yaxis: {
                    labels: { formatter: (val, idx) => parseInt(val) },
                    title: "Filament used",
                  },
                  legend: {
                    show: true,
                  },
                }}
                series={[
                  {
                    name: "Layer",
                    data: getLayerData(printerDetails),
                  },
                ]}
                type="line"
                height={340}
                // width={480}
              />
            </div>
          </div>
        </div>

        {/* </div> */}

        <div className="lg:flex mt-10 justify-between items-start ">
          <div className="border rounded-lg p-3 lg:w-8/12 mt-10 lg:mt-0 shadow-md">
            <h1 className="text-start font-semibold w-full">
              Extrusion Control
            </h1>
            <hr className="my-3"></hr>
            <div className="lg:flex justify-between items-end">
              <div className="">
                <p className="font-light text-start text-sm mb-2">
                  Feed amount in mm
                </p>
                <div className="flex border rounded-lg" id="feedamount"></div>
              </div>

              <div className="">
                <p className="font-light text-start text-sm mb-2">
                  Feed rate in mm/s
                </p>
                <div className="flex border rounded-lg" id="feedrate"></div>
              </div>
            </div>
            <div className="lg:w-full ">
              <div className="pl-auto flex mt-5 lg:mt-0">
                <button
                  id="retract"
                  type="button"
                  className="flex mr-3 py-3 px-3 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  <ArrowSmallUpIcon className="w-5 mr-2" />
                  Retract
                </button>
                <button
                  id="extrude"
                  type="button"
                  className="flex  py-3 px-3  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  <ArrowSmallUpIcon className="w-5 mr-2" />
                  Extrude
                </button>
              </div>
            </div>
          </div>
          <div className="border mt-10 lg:mt-0 rounded-lg p-3 lg:w-4/12 shadow-md lg:ml-5">
            <h1 className="text-start font-semibold w-full flex">
              <CogIcon className="w-5" />
              Fan Control
            </h1>
            <hr className="my-3"></hr>

            <p className="text-start text-sm font-light">Fan Selection</p>
            {printerDetails?.fans?.map((f, idx) => (
              <div
                key={idx}
                className=" mt-3 ml-auto flex justify-between items-center"
              >
                <span>Fan {idx + 1}</span>
                <span>{f?.actualValue || "No data"}</span>
                <div className="w-9/12 flex items-center border rounded-xl items-center ">
                  <input
                    className="w-10/12 mx-3 accent-[#ffa200]  bg-[#E4E7EC]"
                    // className=""
                    type="range"
                    // placeholder=" Input speed"
                    min={f?.min || 0}
                    max={f?.max || 100}
                    id={`fan_speed_${idx}_input`}
                  />
                  <button
                    type="button"
                    className="fan_speed flex py-2 px-3 text-sm text-gray-900 focus:outline-none bg-white border-l rounded-br-2xl rounded-tr-2xl border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
                  >
                    save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:flex mt-10 justify-between items-start">
          <div className="border rounded-lg p-3 lg:w-3/12 shadow-md">
            <h1 className="text-start font-semibold w-full flex">
              <PrinterIcon className="w-5" />
              Job Control
            </h1>
            <hr className="my-3"></hr>

            {printerDetails?.state?.status === "processing" ? (
              <button
                id="pause_print"
                type="button"
                className="my-2 mx-auto w-full flex justify-center font-md items-center flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
              >
                Pause
              </button>
            ) : printerDetails?.state?.status === "paused" ||
              printerDetails?.state?.status === "pausing" ? (
              <button
                id="resume_print"
                type="button"
                className="my-2 mx-auto w-full flex justify-center font-md items-center flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
              >
                Resume
              </button>
            ) : printerDetails?.state?.status === "processing" ? (
              <button
                id="stop_print"
                type="button"
                className="my-2 mx-auto w-full flex justify-center font-md items-center flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
              >
                Stop
              </button>
            ) : (
              <span className="text-slate-400 text-xs">
                The printer is idle.
              </span>
            )}
          </div>

          <div className="border rounded-lg p-3 lg:w-3/12 mt-10 lg:mt-0 shadow-md">
            <h1 className="text-start font-semibold w-full flex">
              <RocketLaunchIcon className="w-5" />Z Babystepping
            </h1>
            <p className="text-xs text-gray-400 text-start mt-1">
              Current offset{" "}
              {printerDetails?.move?.axes?.find((axis) => axis?.letter === "Z")
                ?.babystep || "N/A"}
              mm
            </p>
            <div className="flex flex-col justify-between items-center">
              <div className="w-full flex justify-between items-center mt-3 ">
                <input
                  className="w-20  border border-gray-200 px-2  "
                  type="text"
                  defaultValue="0.05"
                  id="minus_z_babystepping_input"
                />

                <button
                  type="button"
                  id="minus_z_babystepping"
                  className="mx-auto  w-32 flex justify-center font-md items-center  flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                >
                  <ArrowTrendingDownIcon className="w-5 " />
                </button>
              </div>
              <div className="w-full flex justify-between mt-3 items-center">
                <input
                  className="w-20 border border-gray-200  px-2"
                  type="text"
                  id="plus_z_babystepping_input"
                  defaultValue="0.05"
                />

                <button
                  type="button"
                  id="plus_z_babystepping"
                  className="mx-auto w-32 flex justify-center font-md items-center  flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                >
                  <ArrowTrendingUpIcon className="w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-3 lg:w-5/12 mt-10 lg:mt-0 shadow-md">
            <h1 className="text-start font-semibold w-full flex">
              <InformationCircleIcon className="w-5" />
              Collected data
            </h1>
            <hr className=""></hr>
            <div className="flex justify-between items-center my-4">
              <p className=" text-sm text-start">
                Warm-up time<br></br>
                <span className="text-gray-400 font-light text-xs">
                  {printerDetails?.job?.warmUpDuration || "N/A"}
                </span>
              </p>
              <p className=" text-sm text-start">
                Current layer time<br></br>
                <span className="text-gray-400 font-light text-xs">
                  {printerDetails?.job?.layer || "N/A"}
                </span>
              </p>
              <p className=" text-sm text-start">
                Last layer time<br></br>
                <span className="text-gray-400 font-light text-xs">
                  {printerDetails?.job?.layerTime || "N/A"}
                </span>
              </p>
              <p className=" text-sm text-start">
                Job duration<br></br>
                <span className="text-gray-400 font-light text-xs">
                  {printerDetails?.job?.duration || "N/A"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="lg:flex mt-10 justify-between items-start">
          <div className="rounded-lg border  lg:w-3/12 lg:mr-5 shadow-md">
            <div className="flex justify-between px-3 pb-0 pt-3 font-semibold">
              <p className="flex ">
                <InformationCircleIcon className="w-5" /> Job information
              </p>
            </div>
            <hr className="mt-3 "></hr>
            <div className="flex  mt-1 p-3">
              Height{" "}
              <span className=" ml-4 text-gray-400 font-light">
                {printerDetails?.job?.file?.height || "N/A"}
              </span>
            </div>
            <hr className="mt-2"></hr>
            <div className="flex  mt-1 p-3">
              Layer Height{" "}
              <span className=" ml-4 text-gray-400 font-light">
                {printerDetails?.job?.file?.layerHeight || "N/A"}
              </span>
            </div>
            <hr className="mt-2"></hr>
            <div className="flex  mt-1 p-3">
              Filament Usage{" "}
              <span className=" ml-4 text-gray-400 font-light">
                {printerDetails?.job?.file?.filament?.[0] || "N/A"}
              </span>
            </div>
            <hr className="mt-2"></hr>
            <div className="flex  mt-1 p-3">
              Generated by{" "}
              <span className=" ml-4 text-gray-400 font-light">
                {printerDetails?.job?.file?.generatedBy || "N/A"}
              </span>
            </div>
          </div>

          <div className="rounded-lg border mt-10 lg:mt-0  lg:w-5/12 lg:mr-5 shadow-md">
            <div className="flex justify-between px-3 pb-0 pt-3 font-semibold">
              <p className="flex ">
                <WrenchIcon className="w-5" /> Extrusion factors
              </p>
            </div>
            <hr className="mt-3 "></hr>
            {printerDetails?.move?.extruders?.map((e, index) => (
              <div key={index} className="p-3 mt-3">
                <p className="text-start text-sm mb-2">Extruder {index + 1}</p>
                <p className="text-start text-xs mb-3">
                  Current value: {e?.factor || "N/A"}
                </p>
                <div className="flex justify-between items-center ">
                  <input
                    className="accent-[#ffa200] w-8/12 bg-[#fff]"
                    type="range"
                    min="0.1"
                    max="100"
                    id={`extrusion_factor_${index}_input`}
                  />
                  <button
                    type="button"
                    className="extrusion_factor flex py-2 px-3 text-sm text-gray-900 focus:outline-none bg-white border rounded-lg border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className=" lg:w-4/12 mt-10 lg:mt-0 ">
            <div className="border rounded-lg p-3 shadow-md">
              <h1 className="text-start font-semibold w-full flex">
                <InformationCircleIcon className="w-5" />
                Estimations based on
              </h1>
              <hr className=""></hr>
              <div className="flex  items-center my-4">
                <p className=" text-sm text-start mr-4">
                  Filament Usage<br></br>
                  <span className="text-gray-400 font-light text-xs">
                    {printerDetails?.job?.timesLeft?.filament || "N/A"}
                  </span>
                </p>
                <p className=" text-sm text-start">
                  File Progress<br></br>
                  <span className="text-gray-400 font-light text-xs">
                    {printerDetails?.job?.timesLeft?.file || "N/A"}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-lg border mt-10 lg:mt-3  w-12/12  shadow-md">
              <div className="flex justify-between px-3 pb-0 pt-3 font-semibold">
                <p className="flex ">
                  <ClockIcon className="w-5" /> Speed factor
                </p>
              </div>
              <hr className="mt-3 "></hr>
              <div className="p-3 mt-2">
                <p className="text-start text-sm mb-3">
                  Current value: {printerDetails?.move?.speedFactor || "N/A"}
                </p>
                <div className="flex justify-between items-center ">
                  <input
                    className="accent-[#ffa200] w-8/12 bg-[#fff]"
                    type="range"
                    min="0.1"
                    max="100"
                    id="speed_factor_input"
                  />
                  <button
                    type="button"
                    id="speed_factor"
                    className="flex py-2 px-3 text-sm text-gray-900 focus:outline-none bg-white border rounded-lg border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                  >
                    save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="rounded-lg border mt-10  w-12/12  shadow-md">
          <div className="flex justify-between px-3 pb-0 pt-3 font-semibold">
            <p className="flex ">
              <ClockIcon className="w-5" /> Fans
            </p>
          </div>
          <hr className="mt-3 "></hr>

          <div className="p-3 mt-2">
            <p className="text-start text-sm mb-3">Fan 0</p>
            <div className="flex items-center ">
              <button
                type="button"
                className=" flex  py-2 px-3 border rounded-lg text-sm  text-gray-900 focus:outline-none bg-white  border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
              >
                -
              </button>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2 ">
                <div
                  className=" h-2.5 rounded-full "
                  style={{ width: "45%", backgroundColor: "#FFA200" }}
                ></div>
              </div>
              <button
                type="button"
                className=" flex  py-2 px-3  text-sm  text-gray-900 focus:outline-none bg-white  border rounded-lg border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
              >
                +
              </button>
            </div>
          </div>
        </div> */}

        {/* Modals */}
        <Transition.Root show={uploadfiles} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setUploadFiles}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                    {/* <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <ArrowUpTrayIcon
                          className="h-6 w-6 "
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Upload File
                        </Dialog.Title>

                        <div class="mb-3 mt-5">
                          <input
                            class="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                            type="file"
                            id="formFile"
                          />
                        </div>
                        <p
                          class=" text-start text-sm text-gray-500 dark:text-gray-300"
                          id="file_input_help"
                        >
                          file type : Gcode (MAX. 1024MB).
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => setUploadFiles(false)}
                      >
                        Upload
                      </button>
                    </div> */}
                    {/* <Formik
                      initialValues={{ fileName: undefined }}
                      // onSubmit={uploadFiles}
                      validate={(values) => {
                        const errors = {};
                        if (!values.file) {
                          errors.file = "Please select a file";
                        }
                        return errors;
                      }}
                      // onSubmit={(values, { setSubmitting }) => {
                      //   setTimeout(() => {
                      //     alert(JSON.stringify(values, null, 2));
                      //     setSubmitting(false);
                      //   }, 400);
                      // }}
                    >
                      {({ handleSubmit, isSubmitting, setFieldValue }) => (
                        <Form onSubmit={uploadFiles}>
                          <Field
                            name="fileName"
                            type="file"
                            onChange={(event) => {
                              setFieldValue(
                                "file",
                                event.currentTarget.files[0]
                              );
                            }}
                          />
                          <ErrorMessage name="file" component="div" />
                          <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit"}
                          </button>
                        </Form>
                      )}
                    </Formik> */}
                    <form onSubmit={handleFileUpload}>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <ArrowUpTrayIcon
                          className="h-6 w-6 "
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Upload File
                        </Dialog.Title>
                      </div>

                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="relative mt-5 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none "
                      />
                      <button
                        type="submit"
                        className="mt-5 inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Upload
                      </button>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
      <ToastContainer
        newestOnTop={true}
        pauseOnFocusLoss={false}
        position="top-left"
      />
    </div>
  );
};

export default Dashboard;
