import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

export const Quiz = () => {
  //secret: K07J2yPPhzObBT1wyXTFdGTmjzNOEg
  const [currentWatchParent, setCurrentWatchParent] = useState("");
  const [currentWatch, setCurrentWatch] = useState("");

  const [watchPrice, setWatchPrice] = useState(0);

  const [currentImage, setCurrentImage] = useState("");
  const [images, setImages] = useState([]);

  const [imageIndex, setImageIndex] = useState(0);
  const [posts, setPosts] = useState(null);

  const [postNumber, setPostNumber] = useState(2);

  const updatePosts = (newPosts) => {
    setPosts(newPosts);
  };

  const imageChange = (index) => {
    setImageIndex(index);
    setCurrentImage(images[index]);
  };

  const nextWatch = () => {
    setImageIndex(0);
    if (posts && postNumber < posts.length) {
      setCurrentWatchParent(posts[postNumber]);
      setPostNumber(postNumber + 1);
      let wp = posts[postNumber].data;

      fetch("https://www.reddit.com" + wp.permalink + ".json").then((res) => {
        res.json().then((data) => {
          if (data) {

            console.log(data)
            /***
             * This is to get the comment that will have the price in it
             */
            setCurrentWatch(data[1].data.children);
            let postComments = data[1].data.children;

            let keepItGoing = true;

            postComments.forEach((post) => {
              if (keepItGoing) {
              
              if (post.data.is_submitter) {
                let moneyRegEx = new RegExp("[$][0-9.]+|[0-9.]+[$]", "g");
                let noCommasPlease = post.data.body.replace(/,/g, "");
                let result = noCommasPlease.match(moneyRegEx);

                if (result) {
                  console.log(result);
                  if (result.length > 1) {
                    let allResults = [];
                    result.forEach((thisResult) => {
                      console.log(thisResult);
                      let noDolla = thisResult.replace(/\$/g, "");
                      console.log(noDolla);
                      allResults.push(noDolla);
                    });

                    let lowest = 0;

                    allResults.forEach((price) => {
                      let intPrice = Number(price);
                      if (lowest === 0) {
                        lowest = intPrice;
                      } else {
                        if (intPrice < lowest) {
                          lowest = intPrice;
                        }
                      }
                    });
                    setWatchPrice(lowest);
                  } else {
                    let noDolla = result[0].replace(/\$/g, "");
                    setWatchPrice(Number(noDolla));
                  }
                  keepItGoing=false;
                } else {
                    keepItGoing = false;
                }
                console.log(noCommasPlease);
              }

            }
            });

            if (data[0].data.children[0].data.media_metadata) {
              let metaData = data[0].data.children[0].data.media_metadata;
              let items = data[0].data.children[0].data.gallery_data.items;

              let ImagesArray = [];
              items.forEach((item) => {
                let itemData = metaData[item.media_id];
                let tempimgurl = itemData.s.u;
                let imgurl = tempimgurl.replace(/amp;/g, "");
                ImagesArray.push(imgurl);
              });

              /*
                Sets Image Gallery
                */
              setCurrentImage(ImagesArray[0]);
              setImages(ImagesArray);
              setImageIndex(0);
            } else {
              /*
                Handles If there is only one image
                */
               console.log("only one")
              setCurrentImage(
                data[0].data.children[0].data.url_overridden_by_dest
              );
              setImages([]);
            }
          }
        });
      });
    }else{
        console.log('its all maxed out')
    }
  };

  const fetchData = () => {
    fetch("https://www.reddit.com/r/watchexchange/new/.json?limit=100").then((res) => {
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
    if (posts) {
      nextWatch();
    } else {
      fetchData();
    }
  }, [posts]);

  return (
    <>
      <h1>Quiz</h1>
      <div className="questionDisplay">
        <div className="leftButton">
          {images && imageIndex > 0 && (
            <button
              onClick={() => {
                imageChange(imageIndex - 1);
              }}>
              {String.fromCharCode(8592)}
            </button>
          )}
        </div>

        {currentImage && (
          <div className="activeWatch">
            <img src={currentImage} alt="watch" />
          </div>
        )}
        <div className="rightButton">
          {images && imageIndex < images.length - 1 && (
            <button
              onClick={() => {
                imageChange(imageIndex + 1);
              }}>
              {String.fromCharCode(8594)}
            </button>
          )}
        </div>
        {watchPrice && (
          <div>
            <h1>{watchPrice}</h1>
          </div>
        )}
      </div>
      <button onClick={nextWatch}>Next watch</button>
    </>
  );
};
