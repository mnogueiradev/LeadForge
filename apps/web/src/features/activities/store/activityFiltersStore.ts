import { create } from 'zustand';

export interface ActivityFiltersState {
  search: string;
  type: string;
  status: string;
  ownerUserId: string;
  contactId: string;
  organizationId: string;
  pipelineId: string;
  stageId: string;
  
  setFilter: (key: keyof Omit<ActivityFiltersState, 'setFilter' | 'resetFilters' | 'initializeFromURL'>, value: string) => void;
  resetFilters: () => void;
  initializeFromURL: (searchParams: URLSearchParams) => void;
}

const initialState = {
  search: '',
  type: '',
  status: '',
  ownerUserId: '',
  contactId: '',
  organizationId: '',
  pipelineId: '',
  stageId: '',
};

export const useActivityFiltersStore = create<ActivityFiltersState>((set) => ({
  ...initialState,
  
  setFilter: (key, value) => set({ [key]: value }),
  
  resetFilters: () => set(initialState),

  initializeFromURL: (searchParams) => {
    const filters: Partial<ActivityFiltersState> = {};
    Object.keys(initialState).forEach((key) => {
      const val = searchParams.get(key);
      if (val !== null) {
        filters[key as keyof typeof initialState] = val;
      }
    });
    set({ ...initialState, ...filters });
  }
}));

export const useSyncedFilters = (searchParams: URLSearchParams, setSearchParams: (params: URLSearchParams) => void) => {
  const store = useActivityFiltersStore();

  const setFilterAndSync = (key: keyof typeof initialState, value: string) => {
    store.setFilter(key, value);
    
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'none') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const resetAndSync = () => {
    store.resetFilters();
    setSearchParams(new URLSearchParams());
  };

  return {
    ...store,
    setFilterAndSync,
    resetAndSync
  };
};
