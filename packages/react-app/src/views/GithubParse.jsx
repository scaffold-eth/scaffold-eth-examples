import React, { useEffect, useState } from "react";
import { Select, Spin, Avatar, Anchor } from "antd";
import { format } from "date-fns";

import { getAllBranches, pickRecentBranches } from "../scripts/parseBranches";
import styles from "./GithubParse.module.css";

const useRecentBranches = interval => {
  const [branches, setBranches] = useState(null);
  const [recentBranches, setRecentBranches] = useState(null);

  useEffect(() => {
    getAllBranches().then(result => setBranches(result));
  }, []);

  useEffect(() => {
    setRecentBranches(pickRecentBranches(branches, interval));
  }, [branches, interval]);

  return recentBranches;
};

const { Option } = Select;

const DEFAULT_INTERVAL = 7;
const branchPrefix = "https://github.com/austintgriffith/scaffold-eth/tree";

const GithubParse = () => {
  const [interval, setInterval] = useState(DEFAULT_INTERVAL);
  const branches = useRecentBranches(interval);

  const handleChange = value => {
    setInterval(value);
  };

  const formatDate = committedDate => {
    const date = new Date(committedDate);
    return format(date, "eeee, MMMM dd");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Active branches 🔥</h2>
      <p className={styles.interval}>Which interval are you interested in?</p>
      <Select defaultValue={DEFAULT_INTERVAL} style={{ width: 120 }} onChange={handleChange}>
        <Option value={1}>Today</Option>
        <Option value={3}>3 days</Option>
        <Option value={7}>This week</Option>
      </Select>
      {branches ? (
        <>
          {!branches.length && <p className={styles.empty}>Nothing to show for this interval.</p>}
          <div className={styles.branches}>
            {branches.map(branch => {
              const author = branch.target.author;
              const login = author.user && author.user.login;

              return (
                <div className={styles.branchCard}>
                  {login ? (
                    <a href={`https://github.com/${login}`} target="_blank">
                      <Avatar src={author.avatarUrl} size={48} />
                    </a>
                  ) : (
                    <Avatar src={author.avatarUrl} size={48} />
                  )}
                  <div className={styles.description}>
                    <a className={styles.branchName} href={`${branchPrefix}/${branch.name}`} target="_blank">
                      {branch.name}
                    </a>
                    <p className={styles.lastCommit}>
                      Last commit by{" "}
                      {login ? (
                        <a href={`https://github.com/${login}`} target="_blank">
                          {author.name}
                        </a>
                      ) : (
                        author.name
                      )}{" "}
                      at {formatDate(branch.target.committedDate)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className={styles.spinner}>
          <Spin />
        </div>
      )}
    </div>
  );
};

export default GithubParse;
