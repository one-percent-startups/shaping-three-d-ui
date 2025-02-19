import React from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  Cog8ToothIcon,
  ArrowLeftOnRectangleIcon,
  AdjustmentsVerticalIcon,
  ChartBarIcon,
  CodeBracketIcon,
  PrinterIcon,
  FolderIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
// import logo from "../../assets/images/logo.png";
import logo2 from "../../assets/images/logo.png";
import navlogo from "../../assets/images/logo.png";
import { ArrowsRightLeftIcon } from "@heroicons/react/20/solid";

const NavBar = () => {
  const navigate = useNavigate();
  const onLogout = () => {
    navigate("/logout");
  };
  const hideSideBar = () => {
    const hideNav = document.getElementById("default-sidebar");
    const shortNav = document.getElementById("short-sidebar");
    const expandMain = document.getElementById("root");
    if (hideNav.style.display === "block") {
      hideNav.style.display = "none";
      shortNav.style.display = "block";
      // hideNav.style.width = "100px";
      expandMain.style.paddingLeft = "75px";
    } else {
      hideNav.style.display = "block";
      shortNav.style.display = "none";
      expandMain.style.paddingLeft = "255px";
    }
  };
  return (
    <>
      <aside
        id="default-sidebar"
        style={{ backgroundColor: "#101828" }}
        className="fixed top-0 left-0 pr-0 z-40 w-64 h-full overflow-y-auto transition-transform -translate-x-full sm:translate-x-0 "
        aria-label="Sidebar"
      >
        <div className="flex flex-col justify-between space-y-1 px-3 pb-4 h-[90vh]">
          <div className="mt-5">
            <div className=" mb-10 flex justify-between items-center ">
              <img src={navlogo} className="w-[70%] " />
              <button
                data-drawer-target="default-sidebar"
                data-drawer-toggle="default-sidebar"
                aria-controls="default-sidebar"
                type="button"
                onClick={hideSideBar}
                className="inline-flex items-center z-50 p-1  border  text-sm text-gray-500  hover:outline focus:outline-none focus:ring-2 focus:ring-gray-200  bg-[#101828]"
              >
                <span className="sr-only">Open sidebar</span>

                <ArrowsRightLeftIcon className="w-5 text-white" />
              </button>
            </div>
            <ul className="space-y-2 mt-5">
              <li>
                <a
                  href="/printers"
                  className="bg-[#344054] mt-1 flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-[#344054] focus:bg-[#344054]"
                >
                  <span className="flex ml-3 text-md font-medium text-white ">
                    <ChartBarIcon className="w-7 pr-2" />
                    Home
                  </span>
                </a>
                <a
                  href="/globals"
                  className="bg-[#344054] mt-1 flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-[#344054] focus:bg-[#344054]"
                >
                  <span className="flex ml-3 text-md font-medium text-white ">
                    <Cog8ToothIcon className="w-7 pr-2" />
                    Configurations
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-[#344054] text-[#E4E7EC] mt-3">
            <p className="text-sm font-medium mt-3 mb-2 text-start">
              Welcome to Shaping3D !
            </p>
            {/* <p className="text-sm text-start">
              Lorem ipsum dolor sit amet, consectetur adip incididunt
            </p> */}
            {/* <div className="py-4 my-2 rounded-lg bg-[#344054]">
              <img className=" mx-auto w-100" src={logo2} alt="Your Company" />
            </div> */}
            <div className="flex font-medium mt-12">
              <span className="text-sm mr-3">© Shaping3D FZCO</span>
            </div>
          </div>
          <a
            href="/logout"
            className="mt-1 bottom-4 w-[231px] absolute flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-[#344054] focus:bg-[#344054]"
          >
            <span className="flex ml-3 text-md font-medium text-white ">
              <ArrowLeftOnRectangleIcon className="w-8 pr-2" />
              Logout
            </span>
          </a>
        </div>
      </aside>

      {/* Hidden NAV */}

      <aside
        id="short-sidebar"
        style={{ backgroundColor: "#101828", display: "none" }}
        className="transition ease-in-out delay-150 fixed top-0 left-0 pr-0 z-40 w-20 h-full overflow-y-auto transition-transform -translate-x-full sm:translate-x-0 "
        aria-label="Sidebar"
      >
        <div className="flex flex-col justify-between space-y-1 px-3 pb-4 h-[90vh]">
          <div className="my-2">
            <div className="mt-4  flex justify-between items-center ">
              <button
                data-drawer-target="default-sidebar"
                data-drawer-toggle="default-sidebar"
                aria-controls="default-sidebar"
                type="button"
                onClick={hideSideBar}
                className="inline-flex items-center z-50 p-1 mx-auto border  text-sm text-gray-500  hover:outline focus:outline-none focus:ring-2 focus:ring-gray-200  bg-[#101828]"
              >
                <span className="sr-only">Open sidebar</span>

                <ArrowsRightLeftIcon className="w-5 text-white" />
              </button>
            </div>

            <ul className="space-y-2 mt-16">
              <li>
                <a
                  href="/printers"
                  className=" flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-[#344054] focus:bg-[#344054]"
                >
                  <span className="flex  ml-3 text-md font-medium text-white ">
                    <AdjustmentsVerticalIcon className="w-7 pr-2" />
                  </span>
                </a>
                <a
                  href="/landing"
                  className="bg-[#344054] mt-1 flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-[#344054] focus:bg-[#344054]"
                >
                  <span className="flex ml-3 text-md font-medium text-white ">
                    <ChartBarIcon className="w-7 pr-2" />
                  </span>
                </a>
                {/* <a
                  href="/landing"
                  className="mt-1 flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-[#344054] focus:bg-[#344054]"
                >
                  <span className="flex ml-3 text-md font-medium text-white ">
                    <CodeBracketIcon className="w-7 pr-2" />
                  
                  </span>
                </a>
                <a
                  href="/landing"
                  className="mt-1 flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-[#344054] focus:bg-[#344054]"
                >
                  <span className=" flex ml-3 text-md font-medium text-white ">
                    <PrinterIcon className="w-7 pr-2" />
                  
                  </span>
                </a>
                <a
                  href="/landing"
                  className="mt-1 flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-[#344054] focus:bg-[#344054]"
                >
                  <span className="flex ml-3 text-md font-medium text-white ">
                    <FolderIcon className="w-7 pr-2" />
                  
                  </span>
                </a>
                <a
                  href="/classes"
                  className="mt-1 flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-[#344054] focus:bg-[#344054]"
                >
                  <span className="flex ml-3 text-md font-medium text-white ">
                    <Cog6ToothIcon className="w-7 pr-2" />
                    
                  </span>
                </a> */}
                <a
                  href="/logout"
                  className="mt-1 bottom-4  absolute flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-[#344054] focus:bg-[#344054]"
                >
                  <span className="flex ml-3 text-md font-medium text-white ">
                    <ArrowLeftOnRectangleIcon className="w-8 pr-2" />
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};
export default NavBar;
