import { graphql } from "@octokit/graphql";

const githubQuery = `
  query getBranches($after: String!) {
    repository(owner: "austintgriffith", name: "scaffold-eth") {
      refs(refPrefix: "refs/heads/", first: 100, after: $after) {
        nodes {
          name
          target {
            ... on Commit {
              oid
              committedDate
              author {
                name
                avatarUrl
                user {
                  login
                }
              }
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

export const pickRecentBranches = (branches, dayInterval) => {
  if (!branches) {
    return null;
  }

  const deadline = new Date(Date.now() - dayInterval * 86400000);

  return [...branches]
    .sort((x, y) => {
      const lastCommitedX = new Date(x.target.committedDate);
      const lastCommitedY = new Date(y.target.committedDate);

      if (lastCommitedX < lastCommitedY) {
        return 1;
      }
      if (lastCommitedX > lastCommitedY) {
        return -1;
      }

      return 0;
    })
    .filter(x => new Date(x.target.committedDate) > deadline);
};

export const getAllBranches = async () => {
  let moreToFetch = true;
  let branches = [];
  let after = "";

  try {
    while (moreToFetch) {
      const { repository } = await graphql({
        query: githubQuery,
        after,
        headers: { Authorization: `Token ${process.env.REACT_APP_GITHUB_TOKEN}` },
      });

      branches = [...branches, ...repository.refs.nodes];
      moreToFetch = repository.refs.pageInfo.hasNextPage;
      after = repository.refs.pageInfo.endCursor;
    }
    return branches;
  } catch (err) {
    return [];
  }
};
