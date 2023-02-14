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
  };



  const nextWatch = () => {
    if (posts) {
      setCurrentWatchParent(posts[postNumber]);
      setPostNumber(postNumber + 1);
      console.log(posts);
      let wp = posts[postNumber].data
      console.log(wp.domain);
      console.log(wp.permalink)


      console.log(
        "https://www.reddit.com" +
        wp.permalink +
        ".json"
      );
      fetch(
        "https://www.reddit.com" +
        wp.permalink +
        ".json"
      ).then((res) => {
        res.json().then((data) => {
          if (data) {
            console.log(data)
            /**
             * There are 2 items in this i believe
             * the second one has the comments. its something like 
             * data[1].data.children where isSubmitter === true
             * You can figure this one out mena we all believe in you
             */
          }
        });
      });
    } else {
      console.log("nope");
    }
  };

  const fetchData = () => {
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
  useEffect(() => {
    console.log("from useeffect");
    if (posts) {
      nextWatch();
    } else {
      fetchData();
    }

  }, [posts]);
  return (
    <>
      <h1>Quiz</h1>
      <button onClick={fetchData}>get it</button>
    </>
  );
};
