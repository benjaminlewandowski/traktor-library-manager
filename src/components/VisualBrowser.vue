<template>
    <div
        class="visual-browser w-full bg-black-dark -mb-4 border-t border-black"
        :class="class"
    >
        <div
            @scroll="$emit('scroll')"
            ref="smallWrapper"
            class="overflow-scroll h-full w-full"
        >
            <div
                ref="hugeWrapper"
                class="flex flex-wrap w-full h-0 relative huge-wrapper"
                :style="{
                    paddingTop:
                        'calc((100% / ' +
                        coverSize +
                        ' + ' +
                        coverTextHeight +
                        'px) * ' +
                        wrapperLines +
                        ')',
                }"
            >
                <div
                    v-for="(row, index) in tracks"
                    :key="index"
                    class="p-2 absolute transition-width hover:bg-black-light cursor-pointer"
                    :class="[
                        `w-1/${coverSize}`,
                        trackPlayingIndex == row.data.index ? 'active' : '',
                    ]"
                    :style="{
                        left: `calc(${row.rowIndex %
                            coverSize} * 100% / ${coverSize})`,
                        top: `calc(${Math.floor(
                            row.rowIndex / coverSize
                        )} * 100% / ${wrapperLines})`,
                    }"
                    @click="$emit('playTrack', row.data)"
                >
                    <component
                        :is="image"
                        :artist="row.data.artist"
                        :title="row.data.title"
                        :textHeight="coverTextHeight"
                        :src="'local-resource://coverart/200/' + row.data.image"
                    >
                    </component>
                </div>
            </div>
        </div>
        <div
            class="absolute bottom-0 border-t border-black flex justify-end items-center px-4 h-8 w-full bg-black-medium  z-10"
        >
            <span class="text-xs tracking-wider mr-5 text-gray-dark">Size</span>
            <vue-slider
                v-model="coverSizeLocal"
                width="250px"
                :min="4"
                :max="8"
                :adsorb="true"
                :tooltip="'none'"
            />
            <span class="text-xs tracking-wider ml-5 text-gray-dark"
                >{{ coverSize }} per row</span
            >
        </div>
    </div>
</template>

<style></style>

<script>
import Image from "./Image.vue";
import VueSlider from "vue-slider-component";

export default {
    props: {
        tracks: Array,
        class: String,
        filteredSongs: Number,
    },
    data() {
        return {
            images: {},
            image: "Image",
            coverSizeLocal: null,
            coverTextHeight: 48,
        };
    },
    computed: {
        coverSize() {
            return this.$store.getters.coverSize;
        },
        trackPlayingIndex() {
            return this.$store.state.trackPlaying.index;
        },
        wrapperLines() {
            return Math.ceil(this.filteredSongs / this.coverSize);
        },
    },
    watch: {
        coverSizeLocal(newCoverSize, oldCoverSize) {
            if (newCoverSize != oldCoverSize) {
                this.$store.commit("setCoverSize", newCoverSize);
            }
        },
    },
    components: {
        Image,
        VueSlider,
    },
    beforeMount() {
        this.coverSizeLocal = this.coverSize;
    },
    methods: {
        active(index) {
            if (index == trackPlayingIndex) {
                return "active";
            } else {
                return "";
            }
        },
    },
};
</script>
