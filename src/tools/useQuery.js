import { useMemo } from "react";
import { useLocation } from "react-router-dom";

const useQuery = () => {
    const { search } = useLocation();
    return useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search]);
}

export default useQuery;