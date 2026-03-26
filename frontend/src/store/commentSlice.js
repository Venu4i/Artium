import { createSlice } from "@reduxjs/toolkit";
import api from "../api/axios";

const commentSlice = createSlice({
  name: "comments",
  initialState: {
    comments: [],
  },
  reducers: {
    setComments: (state, action) => {
      state.comments = action.payload;
    },
    addComment: (state, action) => {
      state.comments.push(action.payload);
    },
  },
});

export const { setComments, addComment } = commentSlice.actions;

export const fetchComments = (artworkId) => async (dispatch) => {
  try {
    const response = await api.get(`/artworks/${artworkId}/comments`);
    dispatch(setComments(response.data.data.comments));
  } catch (error) {
    console.error("Failed to fetch comments:", error);
  }
};

export const postComment = (artworkId, text) => async (dispatch) => {
  try {
    const response = await api.post(`/artworks/${artworkId}/comments`, { text });
    dispatch(setComments(response.data.data.comments)); // Update comments list
  } catch (error) {
    console.error("Failed to post comment:", error);
  }
};

export default commentSlice.reducer;