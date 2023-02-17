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

  const [potentialAnswers, setPotentialAnswers] = useState([]);
  const [answerIndex, setAnswerIndex] = useState(0);

  const [postNumber, setPostNumber] = useState(2);

  const [imageRotation, setImageRotation] = useState(0);

  const [numCorrect, setNumCorret] = useState(0);
  const [numTotal, setNumTotal] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const updatePosts = (newPosts) => {
    setPosts(newPosts);
  };

  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }
  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }
  const GenerateAnswers = (answer) => {
    //0 is lowest
    //1 second lowest
    //2 second Highest
    //3 highest
    let index = getRandomIntInclusive(0, 3);
    let answers = [];
    setAnswerIndex(index);

    answer = parseInt(answer);

    switch (index) {
      case 0:
        answers.push(answer);
        answers.push(parseInt(answer * 2));
        answers.push(parseInt(answer * 4));
        answers.push(parseInt(answer * 8));
        break;
      case 1:
        answers.push(parseInt(answer / 2));
        answers.push(answer);
        answers.push(parseInt(answer * 2));
        answers.push(parseInt(answer * 4));

        break;
      case 2:
        answers.push(parseInt(answer / 2));
        answers.push(parseInt(answer / 4));
        answers.push(answer);
        answers.push(parseInt(answer * 2));
        break;
      case 3:
        answers.push(parseInt(answer / 2));
        answers.push(parseInt(answer / 4));
        answers.push(parseInt(answer / 8));
        answers.push(answer);
        break;
      default:
        break;
    }

    setPotentialAnswers(answers);
  };

  const imageChange = (index) => {
    setImageIndex(index);
    setCurrentImage(images[index]);
  };


  const nextWatch = (optionalPostNumber = postNumber) => {


    console.log('at the top');
    console.log(optionalPostNumber)
    setImageRotation(0);
    const image = document.getElementById("activeWatch");
    if (image) {
      image.style.transform = `rotate(0deg)`;
    }

    setImageIndex(0);
    if (posts && optionalPostNumber < posts.length) {
      setCurrentWatchParent(posts[optionalPostNumber]);
      setPostNumber(optionalPostNumber + 1);
      console.log(optionalPostNumber);
      let wp = posts[optionalPostNumber].data;

      fetch("https://www.reddit.com" + wp.permalink + ".json").then((res) => {
        res.json().then((data) => {
          if (data) {
            console.log('got data');
            //console.log(data);
            /***
             * This is to get the comment that will have the price in it
             */if (data[1].data.children) {


              setCurrentWatch(data[1].data.children);
              let postComments = data[1].data.children;

              console.log('post and comments')
              console.log(data[0].data.children);
              console.log(data[1].data.children);

              let keepItGoing = true;

              postComments.forEach((post) => {
                console.log('top of foreach')
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
                        console.log('LOwest: ' + lowest)
                        if (lowest < nextLowest / 2) {
                          setWatchPrice(nextLowest);
                          GenerateAnswers(nextLowest);
                        } else {
                          setWatchPrice(lowest);
                          GenerateAnswers(lowest);
                        }
                      } else {
                        let noDolla = result[0].replace(/\$/g, "");
                        noDolla = noDolla.replace(/€/g, "");
                        setWatchPrice(Number(noDolla));
                        GenerateAnswers(noDolla);
                      }

                      keepItGoing = false;
                    } else {
                      console.log('no results')
                      setPotentialAnswers([]);
                      keepItGoing = false;

                      nextWatch(optionalPostNumber + 1);
                    }
                    console.log(noCommasPlease);

                  }
                }
              });//Gets images

              if (data[0].data.children[0].data.media_metadata) {
                console.log('has metadata')
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
                setImages([]);
                let tempUrl =
                  data[0].data.children[0].data.url_overridden_by_dest;
                console.log(tempUrl)
                if (tempUrl.includes("v.redd")) {
                  console.log('vreddit')
                  nextWatch(postNumber + 1);
                } else if (tempUrl.includes("imgur")) {
                  console.log('imgur else if')

                  if (data[0].data.children[0].data.media.oembed) {
                    console.log('oembed');
                    console.log(data[0].data.children[0].data.media.oembed)
                    setCurrentImage(data[0].data.children[0].data.media.toembed.humbnail_url);
                  } else {
                    console.log('thumb')
                    
                    console.log(data[0].data.children[0].data.media)
                  }

                  //<blockquote class="imgur-embed-pub" lang="en" data-id="a/p1Zz504"  ><a href="//imgur.com/a/p1Zz504">2005 Rolex Explorer (D Serial) with Papers</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>
                  //https://imgur.com/a/p1Zz504
                  //nextWatch(optionalPostNumber + 1);
                } else {
                  console.log('neither')
                  setCurrentImage(tempUrl);
                }
              }
            }
          }
        });
      });
    } else {
      console.log('skippin the whole thing are we')
    }

  };

  const rotateImage = () => {
    const image = document.getElementById("activeWatch");
    var imageRotateTemp = imageRotation;
    imageRotateTemp += 90;
    setImageRotation(imageRotateTemp);

    image.style.transform = `rotate(${imageRotateTemp}deg)`;
  };

  const rightAnswer = () => {
    const image = document.getElementById("activeWatch");
    image.style.transform = `rotate(1080deg)`;

    let correctTemp = numCorrect + 1;
    let totalTemp = numTotal + 1;
    let percentageTemp = Math.round((correctTemp / totalTemp) * 100);

    setNumCorret(correctTemp);
    setNumTotal(totalTemp);
    setPercentage(percentageTemp);
    nextWatch();
  };

  const wrongAnswer = () => {
    const image = document.getElementById("activeWatch");
    image.style.transition = "position: absolute;";

    let correctTemp = numCorrect;
    let totalTemp = numTotal + 1;
    let percentageTemp = Math.round((correctTemp / totalTemp) * 100);

    setNumTotal(totalTemp);
    setPercentage(percentageTemp);
  };

  const fetchData = () => {
    fetch("https://www.reddit.com/r/watchexchange/new/.json?limit=100").then(
      (res) => {
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
      }
    );
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
      <div className="pageWrapper">

        <div className="questionDisplay">
          <div className="leftButton">
            {images && imageIndex > 0 && (
              <button
                className=""
                onClick={() => {
                  imageChange(imageIndex - 1);
                }}>
                {String.fromCharCode(8592)}
              </button>
            )}
          </div>

          {currentImage && (
            <div className="activeWatch">
              <img src={currentImage} alt="watch" id="activeWatch" />
            </div>
          )}
          <div className="rightButton ">
            {images && imageIndex < images.length - 1 && (
              <button
                className=""
                onClick={() => {
                  imageChange(imageIndex + 1);
                }}>
                {String.fromCharCode(8594)}
              </button>
            )}
          </div>
        </div>
        <div className="answersParent">
          <div className="toolBox">
            <button className="nextWatch" onClick={() => { nextWatch(postNumber) }}>
              Next watch
            </button>
            <button className="rotate" onClick={rotateImage}>
              Rotate
            </button>
            {percentage && <div className="score">Total: {percentage}%</div>}
          </div>
          {watchPrice && potentialAnswers && (
            <div className="answersDiv">
              {potentialAnswers.map((answer, index) => {
                if (index === answerIndex) {
                  return (
                    <button className="correct" onClick={rightAnswer}>
                      ${answer}
                    </button>
                  );
                } else {
                  return <button className="" onClick={wrongAnswer}>${answer}</button>;
                }
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
