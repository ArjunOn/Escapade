// Open-Meteo weather service — completely free, no API key required
// https://open-meteo.com/

export interface WeatherDay {
  date: string; // YYYY-MM-DD
  weatherCode: number;
  precipitationProbability: number; // 0–100
  temperatureMax: number; // Celsius
  temperatureMin: number;
  description: string;
  icon: string; // emoji
}

const WMO: Record<number, { desc: string; icon: string }> = {
  0:  { desc: "Clear sky",          icon: "☀️"  },
  1:  { desc: "Mainly clear",       icon: "🌤️" },
  2:  { desc: "Partly cloudy",      icon: "⛅"  },
  3:  { desc: "Overcast",           icon: "☁️"  },
  45: { desc: "Foggy",              icon: "🌫️" },
  48: { desc: "Icy fog",            icon: "🌫️" },
  51: { desc: "Light drizzle",      icon: "🌦️" },
  53: { desc: "Drizzle",            icon: "🌦️" },
  55: { desc: "Heavy drizzle",      icon: "🌧️" },
  61: { desc: "Slight rain",        icon: "🌧️" },
  63: { desc: "Rain",               icon: "🌧️" },
  65: { desc: "Heavy rain",         icon: "🌧️" },
  71: { desc: "Light snow",         icon: "🌨️" },
  73: { desc: "Snow",               icon: "❄️"  },
  75: { desc: "Heavy snow",         icon: "❄️"  },
  80: { desc: "Rain showers",       icon: "🌦️" },
  81: { desc: "Showers",            icon: "🌧️" },
  82: { desc: "Violent showers",    icon: "⛈️"  },
  95: { desc: "Thunderstorm",       icon: "⛈️"  },
  99: { desc: "Thunderstorm + hail",icon: "⛈️"  },
};

function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export async function getWeatherForecast(lat: number, lng: number, days = 7): Promise<WeatherDay[]> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&forecast_days=${Math.min(days, 16)}&timezone=auto`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data = await res.json();
    const d = data.daily as {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_probability_max: number[];
    };

    return d.time.map((date, i) => {
      const code = d.weather_code[i] ?? 0;
      const wmo = WMO[code] ?? { desc: "Unknown", icon: "🌡️" };
      return {
        date,
        weatherCode: code,
        precipitationProbability: d.precipitation_probability_max[i] ?? 0,
        temperatureMax: celsiusToFahrenheit(d.temperature_2m_max[i] ?? 0),
        temperatureMin: celsiusToFahrenheit(d.temperature_2m_min[i] ?? 0),
        description: wmo.desc,
        icon: wmo.icon,
      };
    });
  } catch {
    return [];
  }
}

export function isRainy(day: WeatherDay): boolean {
  return day.precipitationProbability >= 60;
}

export function isOutdoorEvent(category?: string | null): boolean {
  if (!category) return false;
  const c = category.toLowerCase();
  return c.includes("outdoor") || c.includes("sport") || c.includes("fitness") ||
    c.includes("hiking") || c.includes("festival") || c.includes("park");
}
