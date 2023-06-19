import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../components/navigation";
import { details_api } from "../config/config";

const formatDate = (date) => {
  if (date) {
    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
  } else return "";
};

export const PrinterConsole = () => {
  const params = useParams();
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    details_api
      .get(`jobs/printer/${params.printerId}/all`)
      .then((res) => res.data)
      .then((res) => {
        setJobsLoading(false);
        setJobs(res);
      })
      .catch((err) => {});
  }, []);

  return (
    <div className="flex flex-row">
      <div className="hidden xs:hidden lg:block md:block">
        <NavBar />
      </div>
      <div>
        <h1 className="text-2xl">Commands</h1>
        <h2 className="text-xl">History</h2>
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr className="even:bg-gray-50">
              <th>Command</th>
              <th>Response</th>
              <th>Responded at</th>
              <th>Created at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {jobs.map((j, idx) => (
              <tr className="divide-x divide-gray-300" key={idx}>
                <td className="whitespace-nowrap px-1">{j?.command}</td>
                <td className="text-left px-3">{j?.response}</td>
                <td className="whitespace-nowrap text-left px-1">
                  {formatDate(j?.responseReceivedAt)}
                </td>
                <td className="whitespace-nowrap text-left px-1">
                  {formatDate(j?.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
