const cloneDeep = require("lodash.clonedeep");
import { nmlCollection, nmlPlaylist } from "./../config/paths.js";

export default {
  mounted() {
    if (localStorage.pathToLibrary) {
      this.$store.commit("setLibraryPath", localStorage.pathToLibrary);
      window.ipcRenderer.send("parseXML", [this.pathToLibrary]);
      console.log("Load library from localStorage: " + this.pathToLibrary);
    }

    window.ipcRenderer.receive("openLibrary", (message) => {
      localStorage.pathToLibrary = message;
      this.$store.commit("setLibraryPath", localStorage.pathToLibrary);
      console.log("Selected library: " + message[0]);
      window.ipcRenderer.send("parseXML", message);
    });

    window.ipcRenderer.receive("buildXML", (message) => {
      console.log(message);
      this.$store.commit("setSaving", false);
      this.$store.commit("setPreventScroll", false);
    });

    window.ipcRenderer.receive("coverArtList", (message) => {
      // >> Create data from XML
      let collection = this.$store.getters.library(nmlCollection);
      let collectionFiltered = [];
      let filenameToIndex = {};

      collection.forEach((track, index) => {
        let filename = track["LOCATION"][0]["$"]["FILE"].replace(/\/\//g, ":");

        // >>> Autocomplete Genre
        let genre = track["INFO"][0]["$"]["GENRE"];
        if (
          this.$store.state.genres.indexOf(genre) < 0 &&
          genre != undefined &&
          genre != ""
        )
          this.$store.commit("addGenre", genre);

        // >>> Autocomplete Tags
        let tags1 = track["INFO"][0]["$"]["COMMENT"];
        if (tags1 != undefined && tags1 != "") {
          tags1 = tags1.split(/[;,]+/).map((item) => item.trim());
        } else {
          tags1 = [];
        }
        let tags2 = track["INFO"][0]["$"]["RATING"];
        if (tags2 != undefined && tags2 != "") {
          tags2 = tags2.split(/[;,]+/).map((item) => item.trim());
        } else {
          tags2 = [];
        }
        let tags = [...tags1, ...tags2];

        if (tags.length > 0) {
          tags.forEach((tag, index) => {
            if (
              this.$store.state.tags.indexOf(tag) < 0 &&
              tag != undefined &&
              tag != ""
            )
              this.$store.commit("addTag", tag);
          });
        }

        // >>> Create Collection rowdata from XML
        collectionFiltered[index] = {
          ["index"]: index,
          ["artist"]: track["$"]["ARTIST"],
          ["title"]: track["$"]["TITLE"],
          ["length"]: this.fancyTimeFormat(
            track["INFO"][0]["$"]["PLAYTIME"],
            true
          ),
          ["genre"]: genre,
          ["comment_1"]: track["INFO"][0]["$"]["COMMENT"],
          ["comment_2"]: track["INFO"][0]["$"]["RATING"],
          ["rating"]: track["INFO"][0]["$"]["RANKING"]
            ? track["INFO"][0]["$"]["RANKING"] / 51
            : 0,
          ["color_code"]: track["INFO"][0]["$"]["COLOR"],
          ["musical_key"]:
            typeof track["MUSICAL_KEY"] === "undefined"
              ? 0
              : track["MUSICAL_KEY"][0]["$"]["VALUE"],
          ["bpm"]:
            typeof track["TEMPO"] === "undefined"
              ? ""
              : Math.round(track["TEMPO"][0]["$"]["BPM"] * 100) / 100,
          ["import_date"]: track["INFO"][0]["$"]["IMPORT_DATE"],
          ["play_count"]: track["INFO"][0]["$"]["PLAYCOUNT"],
          ["path"]: track["LOCATION"][0]["$"]["DIR"].replace(/:/g, ""),
          ["image"]:
            message[index].file == null
              ? null
              : filename.substring(0, filename.lastIndexOf(".")) + ".jpeg",
          ["filename"]: filename,
          ["cue_points"]: track["CUE_V2"],
        };

        // >>> Find tracks by Filename
        filenameToIndex[filename] = index;
      });
      this.$store.commit("setCollection", collectionFiltered);
      this.$store.commit("setRowData", collectionFiltered);
      this.$store.commit("setFilenameToIndex", filenameToIndex);

      // >> Create playlist data
      this.$store.commit(
        "setPlaylistData",
        this.$store.getters.library(nmlPlaylist)
      );
      // foreach()
      // console.log("-- AUTOPLAYLIST --");
      // let autoPlaylistIndex;
      // for (const playlist in self.playlists.SUBNODES[0].NODE) {
      //   let name = self.playlists.SUBNODES[0].NODE[playlist]["$"]["NAME"];
      //   if (name == "Library Manager") autoPlaylistIndex = parseInt(playlist);
      // }
      // let path = `SUBNODES.0.NODE.${autoPlaylistIndex}`;
      // self.$store.commit("removePlaylistFolder", path);
      // console.log(self.playlists.SUBNODES[0].NODE[autoPlaylistIndex]);

      // this.playlists = self.library["NML"]["PLAYLISTS"][0]["NODE"][0];

      this.totalSongs = Object.keys(collectionFiltered).length;
    });

    window.ipcRenderer.receive("parseXML", (xmlAsJS) => {
      this.$store.commit("setLibrary", xmlAsJS);
      console.log(xmlAsJS);

      let collection = this.$store.getters.library(nmlCollection);
      let paths = {};
      collection.forEach((track, index) => {
        paths[index] = {
          path: track["LOCATION"][0]["$"]["DIR"].replace(/:/g, ""),
          file: track["LOCATION"][0]["$"]["FILE"].replace(/\/\//g, ":"),
        };
      });
      window.ipcRenderer.send("coverArtList", cloneDeep(paths));
    });
  },
};
