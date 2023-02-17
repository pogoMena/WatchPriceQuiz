import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

export const Quiz = () => {
  //secret: K07J2yPPhzObBT1wyXTFdGTmjzNOEg
  const [currentWatchParent, setCurrentWatchParent] = useState("");
  const [currentWatch, setCurrentWatch] = useState("");
  const [currentWatchObj, setCurrentWatchObj] = useState({ image: null, price: null, index: null });

  const [nextWatchObject, setNextWatchObject] = useState({ image: null, price: null, index: null });
  const [nextWatchParent, setNextWatchParent] = useState("");

  const [watchPrice, setWatchPrice] = useState(0);

  const [currentImage, setCurrentImage] = useState("");
  const [images, setImages] = useState([]);

  const [nextImage, setNextImage] = useState("");
  const [nextImages, setNextImages] = useState([]);

  const [nextWatchPrice, setNextWatchPrice] = useState(0);


  const [imageIndex, setImageIndex] = useState(0);
  const [posts, setPosts] = useState(null);

  const [potentialAnswers, setPotentialAnswers] = useState([]);
  const [answerIndex, setAnswerIndex] = useState(0);

  const [postNumber, setPostNumber] = useState(2);

  const [imageRotation, setImageRotation] = useState(0);

  const [numCorrect, setNumCorret] = useState(0);
  const [numTotal, setNumTotal] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const [correctAnswerClass, setCorrectAnswerClass] = useState("answer");
  const [wrongAnswerClass, setWrongAnswerClass] = useState("answer");



  const updatePosts = (newPosts) => {
    setPosts(newPosts);
  };

  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }


  const roundToFive = (number) => {

    return (number - (number % 5))

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
        answers.push(roundToFive(answer));
        answers.push(roundToFive(parseInt(answer * 2)));
        answers.push(roundToFive(parseInt(answer * 4)));
        answers.push(roundToFive(parseInt(answer * 8)));
        break;
      case 1:
        answers.push(roundToFive(parseInt(answer / 2)));
        answers.push(roundToFive(answer));
        answers.push(roundToFive(parseInt(answer * 2)));
        answers.push(roundToFive(parseInt(answer * 4)));

        break;
      case 2:
        answers.push(roundToFive(parseInt(answer / 2)));
        answers.push(roundToFive(parseInt(answer / 4)));
        answers.push(roundToFive(answer));
        answers.push(roundToFive(parseInt(answer * 2)));
        break;
      case 3:
        answers.push(roundToFive(parseInt(answer / 2)));
        answers.push(roundToFive(parseInt(answer / 4)));
        answers.push(roundToFive(parseInt(answer / 8)));
        answers.push(roundToFive(answer));
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


  const nextWatch = async (optionalPostNumber = postNumber) => {


    console.log('at the top');
    console.log(optionalPostNumber)
    setImageRotation(0);
    const image = document.getElementById("activeWatch");
    if (image) {
      image.style.transform = `rotate(0deg)`;
    }
    if (nextWatchObject) {
      setCurrentWatchObj(nextWatchObject);
      getNextNextWatch(optionalPostNumber + 1);


    } else {
      setImageIndex(0);
      if (posts && optionalPostNumber < posts.length) {
        setCurrentWatchParent(posts[optionalPostNumber]);
        setNextWatchParent(posts[optionalPostNumber + 1]);
        setPostNumber(optionalPostNumber + 1);
        console.log(optionalPostNumber);
        let wp = posts[optionalPostNumber].data;



        fetch("https://www.reddit.com" + wp.permalink + ".json").then((res) => {
          res.json().then((data) => {
            if (data) {

              console.log('lets go')
              let success = GetPrice(data, optionalPostNumber);
              console.log(success)
              console.log('yoooo')
              if (success) {

                let gotImage = GetImages(data[0].data.children[0].data)
                console.log(gotImage)
                if (!gotImage) {
                  console.log('aint got image');
                  nextWatch(optionalPostNumber + 1);
                } else {

                }

              } else {
                console.log('next watch?')
                nextWatch(optionalPostNumber + 1);
              }



            }
          })
        }).then(() => { getNextNextWatch(optionalPostNumber + 1) });

      } else {
        console.log('skippin the whole thing are we')
      }
    }
  };

  const getNextNextWatch = async (optionalPostNumber = postNumber + 1) => {

    let nextWp = await posts[optionalPostNumber + 1].data
    console.log('its right before nextwp')
    console.log(nextWp)

    if (nextWp.permalink) {


      fetch("https://www.reddit.com" + nextWp.permalink + ".json").then((res) => {
        res.json().then((data) => {
          console.log('looking for next image')
          if (data) {
            let success = GetNextPrice(data, optionalPostNumber + 1);
            if (success) {
              let gotImage = GetNextImages(data[0].data.children[0].data)
              console.log(gotImage)
              if (!gotImage) {
                console.log('aint got image');
                nextWatch(optionalPostNumber + 1);
              }

            } else {
              console.log('next watch?')
              nextWatch(optionalPostNumber + 1);
            }



          }
        })
      })

    } else {
      console.log('fail')
    }
  }
  const GetPrice = (data, optionalPostNumber) => {

    var promise = new Promise(() => {


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
                    setWatchPrice(nextLowest);
                    setCurrentWatchObj({ price: nextLowest })
                    GenerateAnswers(nextLowest);
                    Promise.resolve(true);
                  } else {
                    setWatchPrice(lowest);
                    setCurrentWatchObj({ price: lowest })
                    GenerateAnswers(lowest);
                    Promise.resolve(true);
                  }
                } else {
                  let noDolla = result[0].replace(/\$/g, "");
                  noDolla = noDolla.replace(/€/g, "");
                  setWatchPrice(Number(noDolla));
                  setCurrentWatchObj({ price: Number(noDolla) })
                  GenerateAnswers(noDolla);
                  Promise.resolve(true);
                }
              } else {
                console.log('no results')
                setPotentialAnswers([]);
                keepItGoing = false;
                Promise.resolve(false);
              }

            }
          }
        });

      } else {

        console.log('aint nuthin')
        Promise.resolve(false);
      }
    });

    return promise;
  }

  const GetNextPrice = (data, optionalPostNumber) => {

    var promise = new Promise(() => {



      console.log('got data');
      console.log(data[1].data.children)

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
                    setNextWatchPrice(nextLowest);
                    //GenerateAnswers(nextLowest);
                    Promise.resolve(true);
                  } else {
                    setNextWatchPrice(lowest);
                    //GenerateAnswers(lowest);
                    Promise.resolve(true);
                  }
                } else {
                  let noDolla = result[0].replace(/\$/g, "");
                  noDolla = noDolla.replace(/€/g, "");
                  setNextWatchPrice(Number(noDolla));
                  //GenerateAnswers(noDolla);
                  Promise.resolve(true);
                }
              } else {
                console.log('no results')
                //setPotentialAnswers([]);
                keepItGoing = false;
                Promise.resolve(false);
              }

            }
          }
        });

      } else {

        console.log('aint nuthin')
        Promise.resolve(false);
      }
    });

    return promise;
  }

  const GetImages = (data) => {

    var promise = new Promise(() => {


      if (data.media_metadata) {
        console.log('has metadata')
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
        setCurrentImage(ImagesArray[0]);
        setCurrentWatchObj({ image: ImagesArray[0] })
        setImages(ImagesArray);
        setImageIndex(0);
        Promise.resolve(true);
      } else {
        setImages([]);
        let tempUrl =
          data.url_overridden_by_dest;
        console.log(tempUrl)
        if (tempUrl.includes("v.redd")) {
          console.log('vreddit')
          Promise.resolve(false);
        } else if (tempUrl.includes("imgur")) {
          console.log('imgur else if')

          if (data.media.oembed) {
            console.log('oembed');
            console.log(data.media.oembed)
            let fullPic = data.media.oembed.thumbnail_url.replace("?fb", "")
            setCurrentImage(fullPic);
            setCurrentWatchObj({ image: fullPic })
            Promise.resolve(true);
          } else {
            console.log('thumb')

            console.log(data.media)
            Promise.resolve(false);
          }

          //<blockquote class="imgur-embed-pub" lang="en" data-id="a/p1Zz504"  ><a href="//imgur.com/a/p1Zz504">2005 Rolex Explorer (D Serial) with Papers</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>
          //https://imgur.com/a/p1Zz504
          //nextWatch(optionalPostNumber + 1);
        } else {
          console.log('neither')
          setCurrentImage(tempUrl);
          setCurrentWatchObj({ image: tempUrl });
          Promise.resolve(true);
        }
      }
    });
    return promise;
  }

  const GetNextImages = (data) => {

    var promise = new Promise(() => {


      if (data.media_metadata) {
        console.log('has metadata')
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
        setNextImage(ImagesArray[0]);
        setNextImages(ImagesArray);
        Promise.resolve(true);
      } else {
        setImages([]);
        let tempUrl =
          data.url_overridden_by_dest;
        console.log(tempUrl)
        if (tempUrl.includes("v.redd")) {
          console.log('vreddit')
          Promise.resolve(false);
        } else if (tempUrl.includes("imgur")) {
          console.log('imgur else if')

          if (data.media.oembed) {
            console.log('oembed');
            console.log(data.media.oembed)
            let fullPic = data.media.oembed.thumbnail_url.replace("?fb", "")
            setNextImage(fullPic);
            Promise.resolve(true);
          } else {
            console.log('thumb')

            console.log(data.media)
            Promise.resolve(false);
          }

          //<blockquote class="imgur-embed-pub" lang="en" data-id="a/p1Zz504"  ><a href="//imgur.com/a/p1Zz504">2005 Rolex Explorer (D Serial) with Papers</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>
          //https://imgur.com/a/p1Zz504
          //nextWatch(optionalPostNumber + 1);
        } else {
          console.log('neither')
          setNextImage(tempUrl);
          Promise.resolve(true);
        }
      }
    });
    return promise;
  }

  const rotateImage = () => {
    const image = document.getElementById("activeWatch");
    var imageRotateTemp = imageRotation;
    imageRotateTemp += 90;
    setImageRotation(imageRotateTemp);

    image.style.transform = `rotate(${imageRotateTemp}deg)`;
  };
  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }
  const handleGlow = async () => {
    const answers = document.getElementsByClassName('answer');
    setCorrectAnswerClass("correctanswer");
    setWrongAnswerClass("wronganswer");


    await timeout(2000);
    setCorrectAnswerClass("answer");
    setWrongAnswerClass("answer");
    nextWatch();
  }

  const rightAnswer = () => {
    const image = document.getElementById("activeWatch");
    //image.style.transform = `rotate(1080deg)`;
    handleGlow();
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
              {nextImage && <img src={nextImage} alt="watch" id="activeWatch" />}
              {currentWatchObj.image && <img src={currentWatchObj.image} alt="watch" id="activeWatch" />}
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
            <div className="">
              <button className="nextWatch" onClick={() => { nextWatch(postNumber) }}>
                Next watch
              </button></div>
            <div className="">
              <button className="rotate" onClick={rotateImage}>
                Rotate
              </button></div>
            <div className="score">Total: {percentage}%</div>
          </div>
          {watchPrice && potentialAnswers && (
            <div className="answersDiv">
              {potentialAnswers.map((answer, index) => {
                if (index === answerIndex) {
                  return (
                    <button className={correctAnswerClass} onClick={rightAnswer} key={index}>
                      ${answer}
                    </button>
                  );
                } else {
                  return <button className={wrongAnswerClass} onClick={wrongAnswer} key={index}>${answer}</button>;
                }
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
