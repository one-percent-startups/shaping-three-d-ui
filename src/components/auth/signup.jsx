import Button from "../button";
import { Formik } from "formik";
import { signInSchema } from "../../schema";
import logo from "../../assets/images/logo.png";
// import loginBg from '../../assets/images/login_bg.png'

const Signup = ({ loading, error, signup }) => {
  return (
    <>
      <div className="relative flex min-h-screen text-left">
        <div className="flex flex-col justify-center flex-1 w-1/2 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="absolute top-8 left-8">
            <img className="w-auto h-16" src={logo} alt="Your Company" />
          </div>
          <div className="w-full max-w-sm mx-auto">
            <div>
              <h2 className="text-3xl font-medium tracking-tight text-gray-900">
                Sign Up
              </h2>
              <p className="my-2 text-sm font-normal text-gray-500">
                Welcome! Please enter your details
              </p>
            </div>

            <div className="mt-8">
              {error !== null && (
                <p className="text-sm text-red-700">{error}</p>
              )}
              <div className="mt-6">
                <Formik
                  initialValues={{ name: "", email: "", password: "" }}
                  validationSchema={signInSchema}
                  onSubmit={signup}
                >
                  {({
                    handleBlur,
                    handleChange,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                    isValid,
                  }) => (
                    <form
                      className="space-y-5"
                      onSubmit={handleSubmit}
                      noValidate={true}
                    >
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Full Name
                        </label>
                        <div className="mt-1">
                          <input
                            id="name"
                            placeholder="Full Name"
                            name="name"
                            type="text"
                            autoComplete
                            required={true}
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          />
                          {touched.name && (
                            <p className="text-xs text-red-700 ">
                              {errors.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email
                        </label>
                        <div className="mt-1">
                          <input
                            id="email"
                            placeholder="Email"
                            name="email"
                            type="email"
                            autoComplete="true"
                            required={true}
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          />
                          {touched.email && (
                            <p className="text-xs text-red-700 ">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="">
                        <div>
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Password
                          </label>
                          <div className="mt-1">
                            <input
                              id="password"
                              placeholder="Password"
                              name="password"
                              type="password"
                              autoComplete="true"
                              required={true}
                              value={values.password}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            />
                            {touched.password && (
                              <p className="text-xs text-red-700 ">
                                {errors.password}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="">
                        <Button
                          type="submit"
                          className=""
                          style={{ backgroundColor: "#FFA200" }}
                          loading={loading}
                        >
                          Sign In
                        </Button>
                      </div>
                    </form>
                  )}
                </Formik>
                <div className="text-center mt-6">
                  <p className="text-sm inline-flex text-center">
                    Already a member? &nbsp;
                    <a
                      href="/"
                      className="text-sm underline "
                      style={{ color: "#FFA200" }}
                    >
                      Login
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="fixed bottom-6 lg:-ml-12 text-gray-400 text-sm">
            &copy;Shaping3D 2023
          </p>
        </div>
        <div className="relative hidden w-1/2 text-center md:flex-1 lg:block bg-gray-300">
          <div className="w-100 absolute top-0 bottom-0 right-0 flex items-center bg-grey">
            {/* <img
              className="w-full h-full py-10 object-cover"
              src="https://portal.itkkids.xyz/images/background.png"
              alt=""
            /> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
