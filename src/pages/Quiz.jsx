import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

export const Quiz = () => {
    const [searchStart, setSearchStart] = useState(100);
  //secret: K07J2yPPhzObBT1wyXTFdGTmjzNOEg
  const [currentWatchParent, setCurrentWatchParent] = useState("");
  const [currentWatch, setCurrentWatch] = useState("");
  const [currentWatchObj, setCurrentWatchObj] = useState({
    image: null,
    price: null,
    index: null,
  });

  const [nextWatchObject, setNextWatchObject] = useState({
    image: null,
    price: null,
    index: null,
  });
  const [nextWatchParent, setNextWatchParent] = useState("");

  const [watchPrice, setWatchPrice] = useState(0);

  //const [currentImage, setCurrentImage] = useState("");
  const [images, setImages] = useState([]);

  const [imageIndex, setImageIndex] = useState(0);
  const [posts, setPosts] = useState(null);

  const [potentialAnswers, setPotentialAnswers] = useState([]);

  const [postIndex, setPostIndex] = useState(2);

  const [imageRotation, setImageRotation] = useState(0);

  const [numCorrect, setNumCorret] = useState(0);
  const [numTotal, setNumTotal] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const [correctAnswerClass, setCorrectAnswerClass] = useState("answer");
  const [wrongAnswerClass, setWrongAnswerClass] = useState("answer");
  const [spinClass, setSpinClass] = useState("");

  const [currentImage, setCurrentImage] = useState("");

  const NextWatch = async (optionalPostNumber = postIndex) => {
    //resets the image to the first in the index
    setImageIndex(0);
    if (currentWatchObj.image && nextWatchObject.image) {
      let tempimage = document.getElementById("activeWatch");
      tempimage.style.transform = `rotate(0deg)`;
      setImageRotation(0);
    }

    //If posts exist and it isnt and outofbounds exception
    if (posts && optionalPostNumber < posts.length) {
      console.log("got posts");
      //I need to do something here

      /*
      //I think i dont need this
      setCurrentWatchParent(posts[optionalPostNumber]);
      */

      //Sets nextWatchParent and increments postIndex
      setNextWatchParent(posts[optionalPostNumber]);
      setPostIndex(optionalPostNumber + 1);
      let wp = posts[optionalPostNumber].data;
      var tempWatchObject = { price: null, image: null, index: null };

      fetch("https://www.reddit.com" + wp.permalink + ".json").then((res) => {
        res.json().then(async (data) => {
          if (data) {
            console.log("got data");

            let price = await GetPrice(data, optionalPostNumber);

            console.log(price);
            console.log("yo");

            if (price) {
              console.log("it thinks theres a price");
              tempWatchObject.price = price;
              //setNextWatchObject({price: success})
              console.log(price);

              /*

              WE ARE GOOD TO THIS POINT

              */
              console.log("image is next");
              let image = await GetImages(data[0].data.children[0].data);

              console.log(image);

              if (!image) {
                console.log("unsuccessful image gang");
                //Unsuccessful. dont set nextWatchObject and go to the next item
                NextWatch(optionalPostNumber + 1);
              } else {
                tempWatchObject.image = image;

                let index = await GenerateAnswers(price);
                console.log(index);

                if (index) {
                  tempWatchObject.index = index;
                  console.log(tempWatchObject);
                  if (!currentWatchObj) {
                    //If statement if there isnt a currentwatchobj already
                    setCurrentWatchObj(tempWatchObject);
                    NextWatch(optionalPostNumber + 1);
                  } else {
                    //if there is already a currentwatchobject
                    setCurrentWatchObj(nextWatchObject);
                    setNextWatchObject(tempWatchObject);
                  }
                } else {
                  //no index? idk
                }
              }
            } else {
              console.log("fail");
              NextWatch(optionalPostNumber + 1);
            }
          }
        });
      });
    } else {
      console.log("skippin the whole thing are we");
      setPostIndex(0);
      //let random = await fetchData();
      //console.log(random)

    }
  };

  async function GetPrice(data, optionalPostNumber) {
    /***
     * This is to get the comment that will have the price in it
     */ if (data[1].data.children) {
      setCurrentWatch(data[1].data.children);
      let postComments = data[1].data.children;
      let keepItGoing = true;

      let finalResult = false;

      postComments.forEach((post) => {
        if (keepItGoing) {
          if (post.data.is_submitter) {
            let moneyRegEx = new RegExp("[$,€][0-9.]+|[0-9.]+[$,€]", "g");
            let noCommasPlease = post.data.body.replace(/,/g, "");
            let result = noCommasPlease.match(moneyRegEx);

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
                  GenerateAnswers(nextLowest);
                  finalResult = nextLowest;
                  keepItGoing = false;
                } else {
                  setWatchPrice(lowest);
                  //setCurrentWatchObj({ price: lowest })
                  GenerateAnswers(lowest);
                  console.log(lowest);
                  finalResult = lowest;
                  keepItGoing = false;
                }
              } else {
                let noDolla = result[0].replace(/\$/g, "");
                noDolla = noDolla.replace(/€/g, "");
                setWatchPrice(Number(noDolla));
                //setCurrentWatchObj({ price: Number(noDolla) })
                GenerateAnswers(noDolla);
                finalResult = Number(noDolla);
                keepItGoing = false;
              }
            } else {
              setPotentialAnswers([]);
              console.log(post.data);
              keepItGoing = false;
            }
          }
        }
      });
      return finalResult;
    } else {
      console.log();

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
      setImages([]);
      let tempUrl = data.url_overridden_by_dest;

      if (tempUrl.includes("v.redd")) {
        //If it is a video link
        console.log("vreddit");
        return false;
      } else if (tempUrl.includes("imgur")) {
        //If it is an imgur link
        console.log("imgur else if");
        if (data.media.oembed) {
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
    console.log(answers);
    return { answers: answers, index: index };
    //setPotentialAnswers(answers);
  };

  const imageChange = (index) => {
    setImageIndex(index);
    setCurrentImage(currentWatchObj.image.images[index]);
  };

  const rotateImage = () => {
    const image = document.getElementById("activeWatch");
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
    const image = document.getElementById("activeWatch");
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
    const image = document.getElementById("activeWatch");
    //image.style.transition = "position: absolute;";
    handleGlow();

    let correctTemp = numCorrect;
    let totalTemp = numTotal + 1;
    let percentageTemp = Math.round((correctTemp / totalTemp) * 100);

    setNumTotal(totalTemp);
    setPercentage(percentageTemp);
  };

  const fetchData = async () => {
    fetch(`https://www.reddit.com/r/watchexchange/new/.json?limit=100?count-${searchStart}`).then(
      (res) => {
        setSearchStart(searchStart+100)
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
      }
      
    );
  };

  //This zooms the picture
  //When it zooms the picture it doesnt work right
  //I want to make it so that i can change the level of zoom

  const PictureZoom = (event) => {
    let leftButton = document.getElementsByClassName("leftButton")[0];
    console.log(leftButton);
    let original = document.querySelector("#activeWatch"),
      magnified = document.querySelector("#picZoom"),
      style = magnified.style,
      x = event.pageX + original.offsetLeft,
      y = event.pageY - original.offsetTop,
      imgWidth = original.offsetWidth,
      imgHeight = original.offsetHeight,
      xperc = (x / imgWidth) * 100,
      yperc = (y / imgHeight) * 100;
    console.log(original.offsetLeft);

    //lets user scroll past right edge of image
    if (x > 0.01 * imgWidth) {
      xperc += 0.15 * xperc;
    }

    //lets user scroll past bottom edge of image
    if (y >= 0.01 * imgHeight) {
      yperc += 0.15 * yperc;
    }

    style.backgroundPositionX = xperc - 9 + "%";
    style.backgroundPositionY = yperc - 9 + "%";

    style.left = x - 180 + "px";
    style.top = y - 180 + "px";
  };

  useEffect(() => {
    if (posts) {
      NextWatch();
    } else {
      fetchData();
    }
  }, [posts]);

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
                  src={currentImage}
                  alt="watch"
                  id="activeWatch"
                  className={spinClass}
                  onMouseMove={(event) => {
                    PictureZoom(event);
                  }}
                />
                {currentWatchObj.image &&
                  currentWatchObj.image.images &&
                  imageIndex < currentWatchObj.image.images.length - 1 && (
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
                    background: `url(${currentImage}) no-repeat #FFF`,
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
              <div className="score">Total: {percentage}%</div>
            </div>
            {currentWatchObj.index && (
              <div className="answersDiv">
                {currentWatchObj.index.answers.map((answer, index) => {
                  if (index === currentWatchObj.index.index) {
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
