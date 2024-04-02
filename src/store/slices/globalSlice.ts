import { createSlice } from '@reduxjs/toolkit';

type State = {};

const initialState: State = {};

const globalSlice = createSlice({
    name: 'global',

    initialState,

    reducers: {},
});

// export const {} = globalSlice.actions;

export default globalSlice.reducer;
