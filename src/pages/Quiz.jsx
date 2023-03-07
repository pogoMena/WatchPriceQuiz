import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

export const Quiz = () => {
  const [searchStart, setSearchStart] = useState(100);
  //secret: K07J2yPPhzObBT1wyXTFdGTmjzNOEg

  const [currentWatchObj, setCurrentWatchObj] = useState({
    image: null,
    answers: null,
    index: null,
  });

  const [nextWatchObject, setNextWatchObject] = useState({
    image: null,
    answers: null,
    index: null,
  });

  //const [currentImage, setCurrentImage] = useState("");

  const [imageIndex, setImageIndex] = useState(0);
  const [posts, setPosts] = useState(null);
  const [hasCalledNextWatch, setHasCalledNextWatch] = useState(false);

  const [postIndex, setPostIndex] = useState(2);

  const [imageRotation, setImageRotation] = useState(0);

  const [numCorrect, setNumCorret] = useState(0);
  const [numTotal, setNumTotal] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const [correctAnswerClass, setCorrectAnswerClass] = useState("answer");
  const [wrongAnswerClass, setWrongAnswerClass] = useState("answer");

  const [currentImage, setCurrentImage] = useState("");

  const [currentZoomWidth, setCurrentZoomWidth] = useState(340);
  const [zoomSizeString, setZoomSizeString] = useState("Large");

  /*

  **********   TODO     **********
  Piczoom{
  Adjustable zoom variable
    Would need to adjust the centering of everything

  Make zoom work when image is rotated, no idea how i would do that.

  }

  Next watch{
    it doesnt initially work sometimes. if there isnt a watch visible, go the next one
  }

  next image{
    i dont know what happens, but ill click on next image and it will be a previous watch. fix it
  }

  on lines 140ish its a bit of a mess, idk why its not working. those if else mfs

fix changezoom

  */

  const NextWatch = async (
    optionalPostNumber = postIndex,
    nextPost = false
  ) => {
    //resets the image to the first in the index
    setImageIndex(0);
    if (currentWatchObj.image && nextWatchObject.image) {
      let tempimage = document.getElementById("activeWatchImg");
      tempimage.style.transform = `rotate(0deg)`;
      setImageRotation(0);
    }

    //If posts exist and it isnt and outofbounds exception
    if (posts && optionalPostNumber < posts.length) {
      setPostIndex(optionalPostNumber + 1);
      let wp = posts[optionalPostNumber].data;
      var tempWatchObject = { answers: null, image: null, index: null };

      fetch("https://www.reddit.com" + wp.permalink + ".json").then((res) => {
        res.json().then(async (data) => {
          if (data) {
            let answers = await GetPrice(data, optionalPostNumber);

            if (answers) {
              console.log("Price Success");
              tempWatchObject.answers = answers.answers;
              tempWatchObject.index = answers.index;
              let image = await GetImages(data[0].data.children[0].data);

              if (!image) {
                console.log("FAIL: IMAGE");
                NextWatch(optionalPostNumber + 1, nextPost);
              } else {
                console.log("Image Success");
                tempWatchObject.image = image;
                if (
                  !currentWatchObj.image &&
                  !nextWatchObject.image &&
                  !nextPost
                ) {
                  //If statement if there isnt a currentwatchobj already
                  console.log("FULL SUCCESS");
                  console.log("Setting Current");
                  console.log("");
                  setCurrentWatchObj(tempWatchObject);
                  NextWatch(optionalPostNumber + 1, true);
                } else if (nextPost) {
                  console.log("FULL SUCCESS");
                  console.log("Setting Next");
                  console.log("");
                  setNextWatchObject(tempWatchObject);
                } else {
                  //if there is already a currentwatchobject

                  console.log("FULL SUCCESS");
                  console.log("Replacing Current With Next");
                  console.log("");
                  setCurrentWatchObj(nextWatchObject);
                  setNextWatchObject(tempWatchObject);
                }
              }
            } else {
              console.log("FAIL: PRICE");
              NextWatch(optionalPostNumber + 1, nextPost);
            }
          }
        });
      });
    }
  };

  async function GetPrice(data, optionalPostNumber) {
    /***
     * This is to get the comment that will have the price in it
     */
    if (data[1].data.children) {
      let postComments = data[1].data.children;

      let finalResult = false;

      for (let i = 0; i < postComments.length; i++) {
        const post = postComments[i];
        if (post.data.is_submitter) {
          let moneyRegEx = new RegExp("[$,€][0-9.]+|[0-9.]+[$,€]", "g");
          let noCommasPlease = post.data.body.replace(/,/g, "");
          let result = noCommasPlease.match(moneyRegEx);

          console.log(noCommasPlease);
          if (result) {
            if (result.length > 1) {
              let allResults = [];
              result.forEach((thisResult) => {
                let noDolla = thisResult.replace(/\$/g, "");
                noDolla = noDolla.replace(/€/g, "");
                allResults.push(noDolla);
              });
              let lowest = 0;
              let nextLowest = 0;

              allResults.forEach((price) => {
                let intPrice = Number(price);
                if (lowest === 0) {
                  lowest = intPrice;
                } else {
                  if (intPrice < lowest) {
                    nextLowest = lowest;
                    lowest = intPrice;
                  }
                }
              });
              if (lowest < nextLowest / 2) {
                //setWatchPrice(nextLowest);
                //setCurrentWatchObj({ price: nextLowest })

                //I NEED TO MAKE A NEXTANSWERSOBJECT
                finalResult = await GenerateAnswers(nextLowest);

                return finalResult;
              } else {
                //setCurrentWatchObj({ price: lowest })
                finalResult = await GenerateAnswers(lowest);

                return finalResult;
              }
            } else {
              let noDolla = result[0].replace(/\$/g, "");
              noDolla = noDolla.replace(/€/g, "");
              //setCurrentWatchObj({ price: Number(noDolla) })
              finalResult = await GenerateAnswers(Number(noDolla));

              return finalResult;
            }
          }
        }
      }
    } else {
      console.log("FAIL: PRICE REGEX");

      return false;
    }
  }

  const GetImages = async (data) => {
    if (data.media_metadata) {
      let metaData = data.media_metadata;
      let items = data.gallery_data.items;

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
      //setCurrentImage(ImagesArray[0]);
      //setCurrentWatchObj({ image: ImagesArray[0] })
      //setImages(ImagesArray);
      setImageIndex(0);
      setCurrentImage(ImagesArray[0]);
      return { images: ImagesArray, image: ImagesArray[0] };
    } else {
      let tempUrl = data.url_overridden_by_dest;

      if (tempUrl.includes("v.redd")) {
        //If it is a video link
        console.log("vreddit");
        return false;
      } else if (tempUrl.includes("imgur")) {
        //If it is an imgur link
        console.log("imgur else if");
        if (data.media?.oembed) {
          console.log("oembed");
          let fullPic = data.media.oembed.thumbnail_url.replace("?fb", "");
          setCurrentImage(fullPic);
          return { image: fullPic };
        } else {
          return false;
        }
      } else {
        setCurrentImage(tempUrl);
        //setCurrentWatchObj({ image: tempUrl });
        return { image: tempUrl };
      }
    }
  };

  const updatePosts = (newPosts) => {
    setPosts(newPosts);
  };

  const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  };

  const roundToFive = (number) => {
    return number - (number % 5);
  };
  const GenerateAnswers = async (answer) => {
    //0 is lowest
    //1 second lowest
    //2 second Highest
    //3 highest
    let index = getRandomIntInclusive(0, 3);
    let answers = [];
    //setAnswerIndex(index);

    answer = parseInt(answer);

    switch (index) {
      case 0:
        answers.push(roundToFive(answer));
        answers.push(roundToFive(parseInt(answer * 2)));
        answers.push(roundToFive(parseInt(answer * 4)));
        answers.push(roundToFive(parseInt(answer * 8)));
        //setNextWatchObject({ index: 0 })
        break;
      case 1:
        answers.push(roundToFive(parseInt(answer / 2)));
        answers.push(roundToFive(answer));
        answers.push(roundToFive(parseInt(answer * 2)));
        answers.push(roundToFive(parseInt(answer * 4)));
        //setNextWatchObject({ index: 1 })
        break;
      case 2:
        answers.push(roundToFive(parseInt(answer / 2)));
        answers.push(roundToFive(parseInt(answer / 4)));
        answers.push(roundToFive(answer));
        answers.push(roundToFive(parseInt(answer * 2)));
        //setNextWatchObject({ index: 2 })
        break;
      case 3:
        answers.push(roundToFive(parseInt(answer / 2)));
        answers.push(roundToFive(parseInt(answer / 4)));
        answers.push(roundToFive(parseInt(answer / 8)));
        answers.push(roundToFive(answer));
        //setNextWatchObject({ index: 3 })
        break;
      default:
        break;
    }
    return { answers: answers, index: index };
    //setPotentialAnswers(answers);
  };

  const imageChange = (index) => {
    const updatedWatchObject = { ...currentWatchObj };
    updatedWatchObject.image.image = updatedWatchObject.image.images[index];
    setCurrentWatchObj(updatedWatchObject);
  };

  const rotateImage = () => {
    const image = document.getElementById("activeWatchImg");
    var imageRotateTemp = imageRotation;
    imageRotateTemp += 90;
    setImageRotation(imageRotateTemp);

    image.style.transform = `rotate(${imageRotateTemp}deg)`;
  };
  function timeout(delay) {
    return new Promise((res) => setTimeout(res, delay));
  }
  const handleGlow = async () => {
    const answers = document.getElementsByClassName("answer");
    setCorrectAnswerClass("correctanswer");
    setWrongAnswerClass("wronganswer");

    await timeout(2000);
    setCorrectAnswerClass("answer");
    setWrongAnswerClass("answer");
    NextWatch();

    return true;
  };

  const rightAnswer = async () => {
    const image = document.getElementById("activeWatchImg");
    image.style.transform = `rotate(1080deg)`;

    image.style.animationName = "spin";
    await handleGlow();

    let correctTemp = numCorrect + 1;
    let totalTemp = numTotal + 1;
    let percentageTemp = Math.round((correctTemp / totalTemp) * 100);

    setNumCorret(correctTemp);
    setNumTotal(totalTemp);
    setPercentage(percentageTemp);
  };

  const wrongAnswer = () => {
    const image = document.getElementById("activeWatchImg");
    //image.style.transition = "position: absolute;";
    handleGlow();

    let correctTemp = numCorrect;
    let totalTemp = numTotal + 1;
    let percentageTemp = Math.round((correctTemp / totalTemp) * 100);

    setNumTotal(totalTemp);
    setPercentage(percentageTemp);
  };

  const fetchData = async () => {
    fetch(
      `https://www.reddit.com/r/watchexchange/new/.json?limit=100?count-${searchStart}`
    ).then((res) => {
      setSearchStart(searchStart + 100);
      if (res.status !== 200) {
        console.log("error");
        return;
      }
      res.json().then((data) => {
        if (data) {
          updatePosts(data.data.children);
          NextWatch();
          return true;
        }
        return false;
      });
    });
  };

  //This zooms the picture
  //When it zooms the picture it doesnt work right
  //I want to make it so that i can change the level of zoom

  const PictureZoom = (event) => {
    let original = document.querySelector("#activeWatchImg"),
      magnified = document.querySelector("#picZoom"), // the zoomed in circle
      style = magnified.style,
      x = event.pageX + original.offsetLeft, // I THINK this is the 'x' within the event, + the distance from the left side of the page
      y = event.pageY + original.offsetTop, // I think this is the same thing, except with the top
      imgWidth = original.offsetWidth, // Width of original picture
      imgHeight = original.offsetHeight, //Height of original picture
      xperc = (x / imgWidth) * 100, //a percentage of the way across the picture
      yperc = (y / imgHeight) * 100; //a percentage of the way from the top of the picture

    //lets user scroll past right edge of image
    if (x > 0.01 * imgWidth) {
      xperc += 0.15 * xperc;
    }

    //lets user scroll past bottom edge of image
    if (y >= 0.01 * imgHeight) {
      yperc += 0.15 * yperc;
    }

    /*
    Changing 9 to a bigger number makes it bigger, smaller makes it smaller
    when changing the number, it becomes off center

    but why? how to fix?

    where does the size of the image come from?

    */

    style.backgroundPositionX = xperc - 9 + "%";
    style.backgroundPositionY = yperc - 9 + "%";

    /*
    I think this is the actual position of the circle, seems like it would be half of 340, but its 180 idk

    */
    style.left = x - 180 + "px";
    style.top = y - 180 + "px";
  };

  const changeZoom = () => {
    var width = currentZoomWidth;
    if (width === 340) {
      width = 360;
      setZoomSizeString("X-Large");
    } else if (width === 360) {
      width = 240;
      setZoomSizeString("Small");
    } else if (width === 240) {
      width = 280;
      setZoomSizeString("Medium");
    } else {
      width = 340;
      setZoomSizeString("Large");
    }

    const magnified = document.querySelector("#picZoom"); // the zoomed in circle
    const style = magnified.style;

    style.width = width + "px";
    style.height = width + "px";

    setCurrentZoomWidth(width);
  };

  useEffect(() => {
    if (posts && !hasCalledNextWatch) {
      console.log("One time i hope");
      NextWatch();
      setHasCalledNextWatch(true);
    } else if (!posts) {
      fetchData();
    }
  }, [posts, hasCalledNextWatch]);

  if (currentWatchObj) {
    return (
      <>
        <div className="pageWrapper">
          <div className="questionDisplay">
            {currentWatchObj.image && (
              <div className="activeWatch">
                {currentWatchObj.image && imageIndex > 0 && (
                  <button
                    className="leftButton"
                    onClick={() => {
                      imageChange(imageIndex - 1);
                    }}>
                    {String.fromCharCode(8592)}
                  </button>
                )}
                <img
                  src={currentWatchObj.image.image}
                  alt="watch"
                  id="activeWatchImg"
                  onMouseMove={(event) => {
                    PictureZoom(event);
                  }}
                />
                {currentWatchObj.image &&
                  currentWatchObj.image.images &&
                  imageIndex < currentWatchObj.image.images.length  && (
                    <button
                      className="rightButton"
                      onClick={() => {
                        imageChange(imageIndex + 1);
                      }}>
                      {String.fromCharCode(8594)}
                    </button>
                  )}
                <div
                  className="picZoom"
                  id="picZoom"
                  alt="?"
                  style={{
                    background: `url(${currentWatchObj.image.image}) no-repeat #FFF`,
                  }}></div>
              </div>
            )}
          </div>
          <div className="answersParent">
            <div className="toolBox">
              <div className="">
                <button
                  className="nextWatch"
                  onClick={() => {
                    NextWatch(postIndex);
                  }}>
                  Next watch
                </button>
              </div>
              <div className="">
                <button className="rotate" onClick={rotateImage}>
                  Rotate
                </button>
              </div>
              <div className="">
                <button className="rotate" onClick={changeZoom}>
                  Zoom
                </button>
                <div className="sizeString">{zoomSizeString}</div>
              </div>
              <div className="score">Total: {percentage}%</div>
            </div>
            {currentWatchObj.answers && (
              <div className="answersDiv">
                {currentWatchObj.answers.map((answer, index) => {
                  if (index === currentWatchObj.index) {
                    return (
                      <button
                        className={correctAnswerClass}
                        onClick={rightAnswer}
                        key={index}>
                        ${answer}
                      </button>
                    );
                  } else {
                    return (
                      <button
                        className={wrongAnswerClass}
                        onClick={wrongAnswer}
                        key={index}>
                        ${answer}
                      </button>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
      </>
    );
  } else {
    return <h1>Loading...</h1>;
  }
};
