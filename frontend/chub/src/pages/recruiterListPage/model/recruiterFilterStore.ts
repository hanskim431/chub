import { create } from "zustand";

interface RecruiterFilterStore {
  field: string;
}

interface RecruiterFilterStoreActions {
  setField: (field: string) => void;
}

const initialState: RecruiterFilterStore = {
  field: "",
};
export const useRecruiterFilterStore = create<
  RecruiterFilterStore & RecruiterFilterStoreActions
>()((set) => ({
  ...initialState,
  setField: (field) => {
    set({ field });
  },
}));
