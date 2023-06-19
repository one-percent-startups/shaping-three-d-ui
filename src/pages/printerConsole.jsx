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
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>Response</th>
              <th>Responded at</th>
              <th>Created at</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j, idx) => (
              <tr key={idx}>
                <td>{j?.command}</td>
                <td>{j?.response}</td>
                <td>{formatDate(j?.responseReceivedAt)}</td>
                <td>{formatDate(j?.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
