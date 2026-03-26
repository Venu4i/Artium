import { createSlice } from "@reduxjs/toolkit";
import api from "../api/axios";

const likesSlice = createSlice({
  name: "likes",
  initialState: {
    totalLikes: 0,
    likedByMe: false,
  },
  reducers: {
    setLikes: (state, action) => {
      state.totalLikes = action.payload.totalLikes;
      state.likedByMe = action.payload.likedByMe;
    },
  },
});

export const { setLikes } = likesSlice.actions;

export const toggleLike = (artworkId) => async (dispatch) => {
  try {
    const response = await api.post(`/artworks/${artworkId}/like`);
    const { artwork } = response.data.data;

    // Update Redux store with the new like data
    dispatch(setLikes({ totalLikes: artwork.totalLikes, likedByMe: artwork.likedByMe }));
  } catch (error) {
    console.error("Failed to toggle like:", error);
  }
};

export default likesSlice.reducer;