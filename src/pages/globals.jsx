import React, { useEffect, useState, Fragment } from "react";
import NavBar from "../components/navigation";
import app_api from "../config/config";
import { ToastContainer, toast } from "react-toastify";
import { Formik } from "formik";

const INITIAL_EDIT = { name: "", unitPrice: null };

const TABS = ["material", "electricity"];

const Globals = () => {
  const [showPage, setShowPage] = useState(TABS[0]);

  const [materials, setMaterial] = useState([]);
  const [matLoading, setMatLoading] = useState(true);
  const [matError, setMatError] = useState(null);

  const [add, setAdd] = useState(false);

  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState();

  const [deleteId, setDeleteId] = useState(null);

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
  }, []);

  const onAddClick = () => setAdd(true);
  const onAddClose = () => setAdd(false);

  const onEditClick = (id) => {
    setEditId(id);
    // console.log(materials.find((m) => m.id === id));
    setEdit(materials.find((m) => m.id === id) || INITIAL_EDIT);
  };
  const onEditClose = () => {
    setEdit(INITIAL_EDIT);
    setEditId(null);
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
                initialValues={{ name: "", unitPrice: "" }}
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
        ) : showPage === 'electricity' ?
        <>Hi</> : null}
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
    </div>
  );
};

export default Globals;
