import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

export const Quiz = () => {
  //secret: K07J2yPPhzObBT1wyXTFdGTmjzNOEg
  const [currentWatchParent, setCurrentWatchParent] = useState("");
  const [currentWatch, setCurrentWatch] = useState("");
  const [posts, setPosts] = useState(null);

  const [postNumber, setPostNumber] = useState(2);

  const updatePosts = (newPosts) => {
    setPosts(newPosts);
    console.log(newPosts);
  };

  useEffect(() => {
    console.log("from useeffect");
    fetchData();
    firstWatch();
  }, [posts]);

  const firstWatch = (poststemp) => {
    if (posts) {
      setCurrentWatchParent(poststemp[postNumber]);
      setPostNumber(postNumber + 1);
      console.log(poststemp);

      /*
    console.log(
      "https://" +
        wp.domain +
        wp.permalink +
        ".json"
    );
    fetch(
      "https://" +
        wp.domain +
        wp.permalink +
        ".json"
    ).then((data) => {
      console.log("next watch");
      console.log(data);
    });
    */
    } else {
      console.log("nope");
    }
  };
  const nextWatch = () => {
    if (posts) {
      setCurrentWatchParent(posts[postNumber]);
      setPostNumber(postNumber + 1);
      console.log(posts);

      /*
    console.log(
      "https://" +
        wp.domain +
        wp.permalink +
        ".json"
    );
    fetch(
      "https://" +
        wp.domain +
        wp.permalink +
        ".json"
    ).then((data) => {
      console.log("next watch");
      console.log(data);
    });
    */
    } else {
      console.log("nope");
    }
  };

  const fetchData = async () => {
    console.log("yo");
    fetch("https://www.reddit.com/r/watchexchange.json").then((res) => {
      if (res.status !== 200) {
        console.log("error");
        return;
      }
      res.json().then((data) => {
        if (data) {
          updatePosts(data.data.children);
          nextWatch();
        }
      });
    });
  };

  return (
    <>
      <h1>Quiz</h1>
      <button onClick={fetchData}>get it</button>
    </>
  );
};
