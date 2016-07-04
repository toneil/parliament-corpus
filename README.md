# parliament-corpus
Tools for building a Swedish speech corpus based on the Swedish Parliament's open data API

## Prerequisites
### `node` and `npm`
These tools run on [node.js]{https://nodejs.org} v. >= 6.2. 
Installation packages can be downloaded from their site or by running the code below.
```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
````

### `ffmpeg`
The source of the speech data is the Parliament's debate video archive. To extract audio files from these videos, and to align sections of the audio with individual speakers, `ffmpeg` is required. 
Further instructions for downloading and installing `ffmpeg` can be found [on their web site]{https://ffmpeg.org/download.html}

## Installation
To install the corpus tools run 
```
npm install -g parliament-corpus
```
If you encounter permission errors, install the tools with `sudo`:
```
sudo npm install -g parliament-corpus
```

## Usage
