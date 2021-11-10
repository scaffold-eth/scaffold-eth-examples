# 🏗 Scaffold-ETH - 🎥 Video Stream Example

> stream video from a backend to a frontend that could be signing every few seconds

(no signing or web3 stuff yet, just streaming and playing a video from a backend...)

install and start:

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git streaming-video
cd streaming-video
git checkout streaming-video
yarn install
yarn chain
yarn start
```


start media server:
```bash
yarn mediaServer
```

Open your frontend at http://localhost:3000 and then...

start stream:
```bash
yarn stream
```

(You should be able to stream to the frontend and watch the video live.)

You may need to repeat the `yarn stream` again and again.

(It might work better if you bring in your own MP4 file that is longer...)

![image](https://user-images.githubusercontent.com/2653167/125209332-4143ec00-e255-11eb-8483-1fc675f227cc.png)


---

The next step for this repo is to merge it with the payment channel stuff.

(As long as you keep paying every 10 seconds, it keeps streaming.)
