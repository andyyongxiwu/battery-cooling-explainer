import {simulate} from './solver.mjs';

self.onmessage = ({data}) => {
  try {
    const result = simulate(data, time => self.postMessage({time}));
    self.postMessage({result});
  } catch (error) {
    self.postMessage({error: error.message});
  }
};
