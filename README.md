# parliament-corpus
Tools for building a Swedish speech corpus based on the Swedish Parliament's open data API.

## Prerequisites
### `node` and `npm`
These tools run on [node.js](https://nodejs.org) v. >= 6.2. 
Installation packages can be downloaded from their site or by running the code below.
```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
````

### `ffmpeg`
The source of the speech data is the Parliament's debate video archive. To extract audio files from these videos, and to align sections of the audio with individual speakers, `ffmpeg` is required. 
Further instructions for downloading and installing `ffmpeg` can be found [on their web site](https://ffmpeg.org/download.html).

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
Installing this package exposes two command line entry points
```
$ corpus-build-cat --cat-path path/to/catalogue [options]
$ corpus-download --cat-path path/to/catalogue -r path/to/download/data/root [options]
```

### corpus-build-cat
The Parliament servers are somewhat fragile, and the ammount of requests needed to get the metadata necessary for downloading the video files and transcripts can cause the servers to reject the user. It is therefore a good idea to construct a metadata catalogue before running the time consuming task of downloading the videos themselves, as this can be done in smaller increments, e.g. by restricting each metadata build task to a certain political party. 

+ `--help, -h` Prints help text.
+ `--cat-path, -c` Sets the metadata catalogue path. If `--append` is used, this needs to be an existing catalogue.
+ `--append, -a` Appends the result of the metadata query to an existing catalogue.
+ `--to, -t` Sets a lower constraint on speeches that will be added to the catalogue. This should be an arbitrarily precise date, i.e. *yyyy-mm-dd*, *yyyy-mm* or *yyyy*. If not specified, this will default to the current date. 
+ `--from, 'f` Sets an upper constraint on speeches that will be added to the catalogue. This should be an arbitrarily precise date, i.e. *yyyy-mm-dd*, *yyyy-mm* or *yyyy*. If not specified, this will default to a value set in the config file. Since the recordings started in 2001, it doesn't make a lot of sense to set this date earlier than that.
+ `--party` Only adds speeches made by parliamentarians belonging to a specific party. Parties are denoted by their standard letter codes, e.g `s` for Socialdemokraterna and `mp` for Miljöpartiet. The party formerly known as Folkpartiet is now denoted by `l` (Liberalerna).

### corpus-download
Downloads videos and transcripts for all speeches listed in the input catalogue, and extracts audio files from these.
The audio files are segmented so as to align with the transcripts.

+ `--help, -h` Prints help text.
+ `--cat-path, -c` Sets the metadata catalogue to be downloaded.
+ `--root, -r` Sets the root folder for all downloaded data.
+ `--discard, -d` If set, all raw video files will be deleted once the audio has been extracted from them.

### Example usage

```
corpus-build-cat -c catalogue.json -f 2015-05 -t 2015-12-31
corpus-build-cat -c catalogue.json -f 2016-01 -t 2016-07-01 -a
corpus-download  -c catalogue.json -r dataRoot -d
```
