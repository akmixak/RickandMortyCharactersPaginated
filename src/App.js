import React, { useState } from "react";
import { render } from "react-dom";

import { useQuery, gql, NetworkStatus } from "@apollo/client";

let cache;

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
  //console.log(networkStatus);
  const page = React.useRef(1);
  const [fetchMoreLoading, setFetchMoreLoading] = React.useState(false);
  // console.log(loading, networkStatus);
  const handler = React.useCallback(() => {
    // console.log(loading, "loading inside handler");
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
      //currStatus.current = "null";
      page.current = page.current + 1;
    }
  }, [data]);

  const onScrollHandler = React.useCallback(() => {
    console.log("lindwfbilr");
    console.log(
      Math.floor(ref.current.scrollHeight),
      ref.current.scrollTop,
      ref.current.clientHeight
    );

    if (
      Math.floor(
        ref.current.scrollHeight -
          ref.current.scrollTop -
          ref.current.clientHeight
      ) <= 0
    ) {
      handler();
    }
  }, [data, handler, fetchMoreLoading]);
  // React.useEffect(() => {
  //   console.log(loading, "loading inside effect");
  //   ref.current.addEventListener("scroll", onScrollHandler);
  //   //window.addEventListener("scroll", onScrollHandler);
  //   return () => {
  //     .removeEventListener("scroll", onScrollHandler);
  //   };
  // }, [onScrollHandler]);

  if (loading && networkStatus !== NetworkStatus.fetchMore) return "Loading...";
  if (error) return <div>{error.message}</div>;
  return (
    <div
      ref={ref}
      onScroll={onScrollHandler}
      style={{ height: "1000px", overflow: "auto" }}
    >
      <ul

      // style={{ height: "1000px", overflow: "auto" }}
      >
        {data.characters.results.map((character) => {
          return (
            <li
              key={character.id}
              style={{ margin: "auto", width: "min-content" }}
            >
              <div>{character.id}</div>
              <div>{character.name}</div>
              <div>
                <img src={character.image} />
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
  return null;
}

// For Fun Only

function ForFunOnly() {}

function App({ client }) {
  cache = client.cache;
  return (
    <div>
      <CharactersList />
      {/* <ForFunOnly /> */}
    </div>
  );
}

export default App;
