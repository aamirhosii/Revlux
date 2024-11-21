import React, { useState, useEffect} from "react";
import * as Location from 'expo-location'

export const useGetLocation = () => {
    const [lat, setLat] = useState([]);
    const [lon, setLon] = useState([]);

    useEffect(() => {
        ;(async() => {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            setError('permissions to access location was denied')
            return
        }

        let location = await Location.getCurrentPositionAsync({});
        setLat(location.coords.latitude);
        setLon(location.coords.longitude);
        })()
    }, [lat, lon])
    
    return [lat, lon]
}