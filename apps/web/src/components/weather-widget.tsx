"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, Sun, MapPin, Loader2 } from "lucide-react";

interface WeatherData {
    temperature: number;
    weatherCode: number;
}

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Vilseck, Germany Coordinates
    const LAT = 49.6117;
    const LON = 11.7917;

    useEffect(() => {
        async function fetchWeather() {
            try {
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&timezone=Europe%2FBerlin`
                );
                if (!res.ok) throw new Error("Weather fetch failed");
                const data = await res.json();
                setWeather({
                    temperature: data.current.temperature_2m,
                    weatherCode: data.current.weather_code,
                });
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchWeather();
    }, []);

    const getWeatherIcon = (code: number) => {
        // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
        if (code === 0) return <Sun size={18} className="text-[#fbbf24]" />;
        if (code >= 1 && code <= 3) return <Cloud size={18} className="text-gray-400" />;
        if (code >= 51 && code <= 67) return <CloudRain size={18} className="text-blue-400" />;
        if (code >= 71 && code <= 77) return <CloudSnow size={18} className="text-white" />;
        if (code >= 80 && code <= 82) return <CloudRain size={18} className="text-blue-400" />;
        if (code >= 95) return <CloudRain size={18} className="text-yellow-400" />; // Thunderstorm
        return <Cloud size={18} className="text-gray-400" />;
    };

    const getWeatherDescription = (code: number) => {
        if (code === 0) return "Clear";
        if (code >= 1 && code <= 3) return "Cloudy";
        if (code >= 51 && code <= 67) return "Rain";
        if (code >= 71 && code <= 77) return "Snow";
        if (code >= 80 && code <= 82) return "Showers";
        if (code >= 95) return "Storm";
        return "Overcast";
    };

    if (error) return null; // Hide widget on error

    return (
        <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#2a3026]">
            <div className="w-[140px] bg-[#363d31] p-3 flex flex-col items-center justify-center text-center border-r border-white/10">
                <span className="font-bold text-sm text-white">Conditions</span>
                <div className="flex items-center gap-1 mt-1 text-xs text-[#fbbf24]">
                    <MapPin size={10} />
                    <span>Vilseck</span>
                </div>
            </div>
            <div className="flex-1 p-3 flex items-center justify-center gap-3">
                {loading ? (
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                ) : weather ? (
                    <>
                        <div className="flex items-center gap-2">
                            {getWeatherIcon(weather.weatherCode)}
                            <span className="text-sm font-medium text-white">
                                {Math.round(weather.temperature)}°C
                            </span>
                        </div>
                        <span className="text-xs text-gray-400 border-l border-white/10 pl-3">
                            {getWeatherDescription(weather.weatherCode)}
                        </span>
                    </>
                ) : null}
            </div>
        </div>
    );
}
