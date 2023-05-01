import React from "react";

import { useQuery, gql, NetworkStatus } from "@apollo/client";

const GET_CHARACTERS = gql`
  query getCharctersList($page: Int) {
    characters(page: $page) {
      results {
        id
        name
        image
      }
    }
  }
`;

function CharactersList() {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(
    GET_CHARACTERS,
    {
      variables: {
        page: 1,
      },
      notifyOnNetworkStatusChange: true,
    }
  );
  const currStatus = React.useRef(null);
  const ref = React.useRef(null);
  const page = React.useRef(1);
  const handler = React.useCallback(() => {
    if (!loading && currStatus.current !== "refetch") {
      currStatus.current = "refetch";
      fetchMore({
        variables: {
          page: page.current + 1,
        },
        updateQuery(prv, { fetchMoreResult: fetchResult }) {
          if (!fetchResult) {
            return prv;
          }
          return {
            characters: {
              ...prv.characters,
              results: [
                ...prv.characters.results,
                ...fetchResult.characters.results,
              ],
            },
          };
        },
      }).then(() => (currStatus.current = null));
      page.current = page.current + 1;
    }
  }, [fetchMore, loading]);

  const onScrollHandler = React.useCallback(() => {
    if (
      Math.floor(
        ref.current.scrollHeight -
          ref.current.scrollTop -
          ref.current.clientHeight
      ) <= 0
    ) {
      handler();
    }
  }, [handler]);

  if (loading && networkStatus !== NetworkStatus.fetchMore) return "Loading...";
  if (error) return <div>{error.message}</div>;

  return (
    <div
      ref={ref}
      onScroll={onScrollHandler}
      style={{ height: "1000px", overflow: "auto" }}
    >
      <ul>
        {data.characters.results.map((character) => {
          return (
            <li
              key={character.id}
              style={{ margin: "auto", width: "min-content" }}
            >
              <div>{character.id}</div>
              <div>{character.name}</div>
              <div>
                <img src={character.image} alt="Not loaded" />
              </div>
            </li>
          );
        })}
      </ul>
      {/* <button onClick={handler}>Load More</button>; */}
      {loading ? "loading" : null}
      <div style={{ height: "150px", width: "100%" }}></div>
      <div style={{ height: "150px", width: "100%" }}></div>
    </div>
  );
}

function App({ client }) {
  return (
    <div>
      <CharactersList />
      {/* <ForFunOnly /> */}
    </div>
  );
}

export default App;
