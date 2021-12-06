import { createStore } from "vuex";
import functional from "./functional.js";

export default createStore({
	modules: {
		functional: functional,
	},
	state() {
		return {
			// Display
			display: "split", // display setting [split,list,grid]
			sidebar: true,
			scrollSource: "",
			scrollRatio: 0.0,
			preventScroll: false, // prevent during editing rowdata
			activePlaylist: null, // selected playlist, null means all tracks
			showMarkers: false,

			// Filters
			query: "",
			filter: {
				rating: 0,
				color: 0,
			},

			// Tracks
			collection: null,
			playlists: {},
			rowData: null,
			filenameToIndex: null,
			trackPlaying: {},
			trackSelected: {},

			// Autocomplete
			genres: [],
			tags: [],
		};
	},
	mutations: {
		setPreventScroll(state, prevent) {
			state.preventScroll = prevent;
		},
		addGenre(state, genre) {
			state.genres.push(genre);
			state.genres.sort();
		},
		clearAllGenres(state) {
			state.genres = [];
		},

		addTag(state, tag) {
			state.tags.push(tag);
			state.tags.sort();
		},
		clearTags(state) {
			state.tags = [];
		},

		setActivePlaylist(state, playlist) {
			state.activePlaylist = playlist;
		},
		setShowMarkers(state, value) {
			state.showMarkers = value;
		},
		setCollection(state, data) {
			state.collection = data;
		},
		setFilenameToIndex(state, data) {
			state.filenameToIndex = data;
		},
		setRowData(state, data) {
			console.log("setRowData in Vuex Store");
			state.rowData = data;
		},
		showSidebar(state, show) {
			state.sidebar = show;
		},
		setTrackPlaying(state, track) {
			state.trackPlaying = track;
		},
		setDisplay(state, display_type) {
			state.display = display_type;
			localStorage.display = display_type;
		},

		// Display
		setScrollSource(state, source) {
			state.scrollSource = source;
		},
		setScrollRatio(state, ratio) {
			state.scrollRatio = ratio;
		},

		setQuery(state, text) {
			state.query = text;
		},
		setFilter(state, value) {
			state.filter = value;
		},
		addPlaylist(state, playlist) {
			state.playslists["playlist.name"] = playlist.entries;
		},
	},
	actions: {
		setPreventScroll({ commit }, prevent) {
			commit("setPreventScroll", prevent);
		},
	},
});
