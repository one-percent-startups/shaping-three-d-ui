import React, { useEffect, useState, Fragment } from "react";
import NavBar from "../components/navigation";
import app_api from "../config/config";
import { ToastContainer, toast } from "react-toastify";
import { Formik } from "formik";

const INITIAL_EDIT = { name: "", unitPrice: null };
const INITIAL_EDIT_ELEC = {
  startTime: 0,
  endTime: 23,
  weekday: [0, 1, 2, 3, 4, 5, 6],
  rate: null,
};

const TABS = ["material", "electricity"];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMINGS = [
  { value: 0, label: "12:00 AM" },
  { value: 1, label: "1:00 AM" },
  { value: 2, label: "2:00 AM" },
  { value: 3, label: "3:00 AM" },
  { value: 4, label: "4:00 AM" },
  { value: 5, label: "5:00 AM" },
  { value: 6, label: "6:00 AM" },
  { value: 7, label: "7:00 AM" },
  { value: 8, label: "8:00 AM" },
  { value: 9, label: "9:00 AM" },
  { value: 10, label: "10:00 AM" },
  { value: 11, label: "11:00 AM" },
  { value: 12, label: "12:00 PM" },
  { value: 13, label: "1:00 PM" },
  { value: 14, label: "2:00 PM" },
  { value: 15, label: "3:00 PM" },
  { value: 16, label: "4:00 PM" },
  { value: 17, label: "5:00 PM" },
  { value: 18, label: "6:00 PM" },
  { value: 19, label: "7:00 PM" },
  { value: 20, label: "8:00 PM" },
  { value: 21, label: "9:00 PM" },
  { value: 22, label: "10:00 PM" },
  { value: 23, label: "11:00 PM" },
];

const Globals = () => {
  const [showPage, setShowPage] = useState(TABS[0]);

  const [materials, setMaterial] = useState([]);
  const [matLoading, setMatLoading] = useState(true);
  const [matError, setMatError] = useState(null);

  const [electricity, setElectricity] = useState([]);
  const [elecLoading, setElecLoading] = useState(true);
  const [elecError, setElecError] = useState(null);

  const [add, setAdd] = useState(false);
  const [addElec, setAddElec] = useState(false);

  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState(INITIAL_EDIT);
  const [editIdElec, setEditIdElec] = useState(null);
  const [editElec, setEditElec] = useState(INITIAL_EDIT_ELEC);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteIdElec, setDeleteIdElec] = useState(null);

  useEffect(() => {
    app_api
      .get("material")
      .then((res) => res.data)
      .then((res) => {
        setMatLoading(false);
        setMatError(null);
        setMaterial(res);
      })
      .catch((err) => {
        setMatLoading(false);
        setMatError(err?.response?.data?.message || "Error getting materials");
        toast.error(err?.response?.data?.message || "Error getting materials");
      });
    app_api
      .get("electricity")
      .then((res) => res.data)
      .then((res) => {
        setElecLoading(false);
        setElecError(null);
        setElectricity(res);
      })
      .catch((err) => {
        setElecLoading(false);
        setElecError(
          err?.response?.data?.message || "Error getting electrical info"
        );
        toast.error(
          err?.response?.data?.message || "Error getting electrical info"
        );
      });
  }, []);

  const onAddClick = () => setAdd(true);
  const onAddClose = () => setAdd(false);

  const onAddClickElec = () => setAddElec(true);
  const onAddCloseElec = () => setAddElec(false);

  const onEditClick = (id) => {
    setEditId(id);
    setEdit(materials.find((m) => m.id === id) || INITIAL_EDIT);
  };
  const onEditClose = () => {
    setEdit(INITIAL_EDIT);
    setEditId(null);
  };

  const onEditClickElec = (id) => {
    setEditIdElec(id);
    setEditElec(electricity.find((e) => e.id === id) || INITIAL_EDIT_ELEC);
  };
  const onEditCloseElec = () => {
    setEditElec(INITIAL_EDIT_ELEC);
    setEditIdElec(null);
  };

  const onDeleteClick = (id) => setDeleteId(id);
  const onDeleteClose = () => setDeleteId(null);
  const onDelete = () => {
    app_api
      .delete(`material/${deleteId}`)
      .then((res) => {
        let thismaterial = materials.filter((m) => m.id !== deleteId);
        setMaterial(thismaterial);
        setDeleteId(null);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error deleting");
      });
  };

  const onDeleteClickElec = (id) => setDeleteIdElec(id);
  const onDeleteCloseElec = () => setDeleteIdElec(null);
  const onDeleteElec = () => {
    app_api
      .delete(`electricity/${deleteIdElec}`)
      .then((res) => {
        let thiselectricity = electricity.filter((e) => e.id !== deleteIdElec);
        setElectricity(thiselectricity);
        setDeleteIdElec(null);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error deleting");
      });
  };

  const renderModal = ({
    handleBlur,
    handleChange,
    handleSubmit,
    values,
    touched,
    errors,
    onClose,
    saveText,
  }) => (
    <form noValidate onSubmit={handleSubmit}>
      <input
        className="border"
        type="text"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        name="name"
        placeholder="Enter material name"
      />
      <input
        className="border"
        type="number"
        value={values.unitPrice}
        onChange={handleChange}
        onBlur={handleBlur}
        name="unitPrice"
        min={1}
        placeholder="Enter material price per KG"
      />
      <button
        className="flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
        type="submit"
      >
        {saveText}
      </button>
      <button
        type="button"
        className="flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
        onClick={onClose}
      >
        Cancel
      </button>
    </form>
  );

  const renderModalElec = ({
    handleBlur,
    handleChange,
    handleSubmit,
    setValues,
    values,
    touched,
    errors,
    onClose,
    saveText,
  }) => (
    <form noValidate onSubmit={handleSubmit}>
      <select
        name="startTime"
        placeholder="Start time"
        value={values.startTime}
        onChange={handleChange}
        onBlur={handleBlur}
        className="border"
      >
        {TIMINGS.map((item, idx) => (
          <option key={idx} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <select
        name="endTime"
        placeholder="End time"
        value={values.endTime}
        onChange={handleChange}
        onBlur={handleBlur}
        className="border"
      >
        {TIMINGS.map((item, idx) => (
          <option key={idx} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <input
        className="border"
        type="number"
        value={values.rate}
        onChange={handleChange}
        onBlur={handleBlur}
        name="rate"
        min={1}
        placeholder="Enter rate of electricity per kwh"
      />
      <div className="flex">
        {WEEKDAYS.map((d, idx) => (
          <div key={idx} className="mr-1">
            <label htmlFor={d}>{d}</label>
            <input
              id={d}
              type="checkbox"
              checked={values.weekday?.includes(idx)}
              onChange={() => {
                let weekday = values.weekday;
                if (weekday.includes(idx))
                  setValues({
                    ...values,
                    weekday: values.weekday.filter((d) => d !== idx),
                  });
                else
                  setValues({
                    ...values,
                    weekday: [...values.weekday, idx],
                  });
              }}
            />
          </div>
        ))}
      </div>
      <button
        className="flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
        type="submit"
      >
        {saveText}
      </button>
      <button
        type="button"
        className="flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
        onClick={onClose}
      >
        Cancel
      </button>
    </form>
  );

  return (
    <div className="flex flex-row">
      <div className="hidden xs:hidden lg:block md:block">
        <NavBar />
      </div>

      <div className="p-4 pt-6 xs:ml-[0em] md:ml-[3.3em]">
        <div className="flex">
          {TABS.map((t, idx) => (
            <button
              key={idx}
              className={`flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 ${
                showPage == t ? "" : "opacity-50"
              }`}
              disabled={showPage == t}
              onClick={() => setShowPage(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        {showPage === "material" ? (
          <>
            <h3 className="text-2xl text-left">Materials</h3>
            {add ? (
              <Formik
                initialValues={INITIAL_EDIT}
                onSubmit={(values) => {
                  app_api
                    .post("material", values)
                    .then((res) => res.data)
                    .then((res) => {
                      let thismaterial = Array.from(materials);
                      thismaterial.push(res);
                      setMaterial(thismaterial);
                      onAddClose();
                    })
                    .catch((err) => {
                      toast.error(
                        err?.response?.data?.message ||
                          "Error adding material. Please retry"
                      );
                    });
                }}
              >
                {({
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  values,
                  touched,
                  errors,
                }) =>
                  renderModal({
                    handleBlur,
                    handleChange,
                    handleSubmit,
                    values,
                    touched,
                    errors,
                    onClose: onAddClose,
                    saveText: "Add",
                  })
                }
              </Formik>
            ) : (
              <button
                type="button"
                className="flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                onClick={onAddClick}
              >
                Add
              </button>
            )}

            {matLoading ? (
              <span>Loading...</span>
            ) : matError !== null ? (
              <span className="text-red-700">{matError}</span>
            ) : (
              <table className="table-auto divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Price per kg
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    ></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {materials.map((m, idx) => (
                    <tr key={m?.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {m?.name}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {m?.unitPrice}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {deleteId !== null && m?.id == deleteId ? (
                          <button
                            type="button"
                            className="mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                            onClick={onDelete}
                          >
                            Yes
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                            onClick={() => onEditClick(m?.id)}
                          >
                            Edit
                          </button>
                        )}
                        {deleteId !== null && m?.id == deleteId ? (
                          <button
                            type="button"
                            className="mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                            onClick={onDeleteClose}
                          >
                            No
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                            onClick={() => onDeleteClick(m?.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : showPage === "electricity" ? (
          <>
            <h3 className="text-2xl text-left">Electricity rates</h3>
            {addElec ? (
              <Formik
                initialValues={INITIAL_EDIT_ELEC}
                onSubmit={(values) => {
                  app_api
                    .post("electricity", {
                      ...values,
                      endTime: parseInt(values.endTime),
                      startTime: parseInt(values.startTime),
                    })
                    .then((res) => res.data)
                    .then((res) => {
                      let thiselectricity = Array.from(electricity);
                      thiselectricity.push(res);
                      setElectricity(thiselectricity);
                      onAddCloseElec();
                    })
                    .catch((err) => {
                      toast.error(
                        err?.response?.data?.message ||
                          "Error adding electrical rate. Please retry"
                      );
                    });
                }}
              >
                {({
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  setValues,
                  values,
                  touched,
                  errors,
                }) =>
                  renderModalElec({
                    handleBlur,
                    handleChange,
                    handleSubmit,
                    values,
                    touched,
                    errors,
                    onClose: onAddCloseElec,
                    saveText: "Add",
                    setValues,
                  })
                }
              </Formik>
            ) : (
              <button
                type="button"
                className="flex mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                onClick={onAddClickElec}
              >
                Add
              </button>
            )}

            {elecLoading ? (
              <span>Loading...</span>
            ) : elecError !== null ? (
              <span className="text-red-700">{elecError}</span>
            ) : (
              <table className="table-auto divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Start time
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      End time
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Rate
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Weekdays
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    ></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {electricity.map((e, idx) => (
                    <tr key={idx}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {TIMINGS[e?.startTime].label}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {TIMINGS[e?.endTime].label}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {e?.rate}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {e?.weekday?.map((w) => WEEKDAYS[w]).join(",")}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {deleteIdElec !== null && e?.id == deleteIdElec ? (
                          <button
                            type="button"
                            className="mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                            onClick={onDeleteElec}
                          >
                            Yes
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                            onClick={() => onEditClickElec(e?.id)}
                          >
                            Edit
                          </button>
                        )}
                        {deleteIdElec !== null && e?.id == deleteIdElec ? (
                          <button
                            type="button"
                            className="mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                            onClick={onDeleteCloseElec}
                          >
                            No
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="mr-3 py-2 px-5 mr-2  text-sm  text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 "
                            onClick={() => onDeleteClickElec(e?.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : null}
      </div>

      {editId !== null && (
        <div className="p-4 pt-6 xl:ml-[0em] md:ml-[3.3em] position-sticky top-0">
          <Formik
            initialValues={edit}
            onSubmit={(values) => {
              app_api
                .patch(`material/${editId}`, values)
                .then((res) => res.data)
                .then((res) => {
                  let thismaterial = Array.from(materials);
                  thismaterial = thismaterial.map((m) => {
                    if (m.id === editId) return res;
                    else return m;
                  });
                  setMaterial(thismaterial);
                  setEditId(null);
                  setEdit(INITIAL_EDIT);
                })
                .catch((err) => {
                  toast.error(
                    err?.response?.data?.message ||
                      "Error saving data. Please retry"
                  );
                });
            }}
          >
            {({
              handleBlur,
              handleChange,
              handleSubmit,
              values,
              errors,
              touched,
            }) =>
              renderModal({
                handleBlur,
                handleChange,
                handleSubmit,
                values,
                touched,
                errors,
                onClose: onEditClose,
                saveText: "Save",
              })
            }
          </Formik>
        </div>
      )}
      {editIdElec !== null && (
        <div className="p-4 pt-6 xl:ml-[0em] md:ml-[3.3em] position-sticky top-0">
          <Formik
            initialValues={editElec}
            onSubmit={(values) => {
              app_api
                .patch(`electricity/${editIdElec}`, {
                  ...values,
                  endTime: parseInt(values.endTime),
                  startTime: parseInt(values.startTime),
                })
                .then((res) => res.data)
                .then((res) => {
                  let thiselectricity = Array.from(electricity);
                  thiselectricity = thiselectricity.map((e) => {
                    if (e.id === editIdElec) return res;
                    else return e;
                  });
                  setElectricity(thiselectricity);
                  setEditIdElec(null);
                  setEditElec(INITIAL_EDIT_ELEC);
                })
                .catch((err) => {
                  toast.error(
                    err?.response?.data?.message ||
                      "Error saving data. Please retry"
                  );
                });
            }}
          >
            {({
              handleBlur,
              handleChange,
              handleSubmit,
              setValues,
              values,
              errors,
              touched,
            }) =>
              renderModalElec({
                handleBlur,
                handleChange,
                handleSubmit,
                values,
                touched,
                errors,
                setValues,
                onClose: onEditCloseElec,
                saveText: "Save",
              })
            }
          </Formik>
        </div>
      )}
      <ToastContainer newestOnTop={true} />
    </div>
  );
};

export default Globals;
