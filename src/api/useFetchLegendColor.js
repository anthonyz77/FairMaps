import useSWR from 'swr';
import axios from 'axios';

const fetcher = async (url) => {
  const response = await axios.get(url);
  return response.data;
};

export default function useFetchLegendColor(legendColor) {
  const { data: colors} = useSWR(
    legendColor ? `http://localhost:8080/Data/colors/${legendColor}` : null, 
    fetcher
  );

  return {
    colors
  };
}