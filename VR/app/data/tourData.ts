import type { TourChapter } from "../lib/types.ts";

export const TOUR_DURATION_SECONDS = 406.152;

export const TOUR_CHAPTERS: readonly TourChapter[] = [
  {
    id: "concord-ground-experience",
    title: "Concord School — Ground Experience",
    startTime: 0,
    endTime: 280.5,
    sceneId: "concord",
    startHour: 0,
    transcript: `Welcome to the Decarb City Twin VR experience.

You are now inside an immersive virtual environment representing a real neighborhood in Seattle. This simulation combines environmental data, urban modeling, and community knowledge to help you experience how air pollution changes over time and space.

Before we begin, please make sure your headset is comfortable and secure. You can move using the joystick on your controller. Place your thumb on the joystick and gently push it forward to move ahead. Pull the joystick backward to move behind you. Move slowly and carefully as you explore. Please make sure you are standing steadily on the ground. If you prefer, you may also remain still and simply look around.

Now, slowly lift your head and look up at the sky. You should see a moving sun above you. The sun represents the passage of time throughout a single day. As time advances, the sun will travel across the sky from morning to evening, just as it does in the real world. If you do not immediately see the sun, gently turn your head left and right while looking upward. You will notice a bright yellow sphere moving across the sky. That sphere is the sun in this simulation. This movement allows you to understand how environmental conditions change throughout the day.

Now, slowly lower your gaze and look forward. In front of you, you will see a large number of floating particles. Some are small, some are large, and they are constantly moving, drifting, and clustering in different areas. These particles represent PM two point five, very small air pollution particles that can enter the lungs and bloodstream. Higher concentrations of particles indicate worse air quality.

What you are seeing is not random. This visualization shows one of the most polluted days recorded in 2025 for this neighborhood. The simulation begins at midnight — 0:00 — and automatically progresses through the full 24-hour cycle until 23:00. As time advances, watch how the number, size, and density of particles change. You may notice that pollution levels rise and fall during different periods of the day. In some moments, the air may appear relatively clear. In others, the particles become dense, making the space feel heavy and crowded. This reflects real patterns influenced by traffic, industrial activity, weather conditions, and atmospheric movement.

Take a moment to move forward slowly toward the particles. As you walk through them, imagine how people in this community move through the same air in real life — walking to school, commuting to work, or spending time outdoors.

This simulation is centered on Concord International School, an elementary school located near the community center. Many children attend this school daily. On the day represented here, students and families experienced these pollution conditions as part of their normal routine. They walked, played, and learned while surrounded by air that looked invisible but contained harmful particles. By making the invisible visible, this experience helps us understand exposure in a more intuitive way.

You may also notice that particles sometimes gather near street corners or along certain paths. These areas often correspond to places where pollution accumulates in the real urban environment — for example, intersections, enclosed streets, or areas with limited airflow. If you stand still and observe carefully, you will see waves of particles passing through space. These waves represent changing pollution concentrations over time, influenced by wind patterns and daily activity cycles.

There is no need to rush. You are encouraged to explore slowly. Try turning around in place. Look at the environment from different directions. Notice how the particles behave differently depending on where you stand. You may also experiment with moving forward and backward to see how density changes across locations. If at any time you feel uncomfortable, you may stop moving and remain still. The simulation will continue automatically.

This experience is not a game with goals or scores. Instead, it is a data-driven environment designed to help you feel the scale, timing, and presence of air pollution in everyday life. By immersing yourself in this space, you are witnessing how environmental data can be transformed into a tangible experience — one that connects scientific measurement with human perception.

Take a few more moments to observe the particles around you. Notice their motion, density, and how they fill the air. When you are ready, we will continue to the next part of the experience, where you will explore another scene.`,
  },
  {
    id: "south-park-aerial-experience",
    title: "South Park — Aerial Experience",
    startTime: 280.5,
    endTime: TOUR_DURATION_SECONDS,
    sceneId: "south-park",
    startHour: 0,
    transcript: `For the second immersive environment, move to the small park in front of the main school building. Here, we developed a bird’s-eye architectural model that allows you to observe the neighborhood from above.

You are now viewing the city from a higher perspective, similar to how a planner, scientist, or satellite might observe urban conditions. From this vantage point, individual streets, buildings, and open spaces form a connected system, revealing patterns that are difficult to perceive at ground level.

This model visualizes air pollution patterns on both the highest-pollution day and the lowest-pollution day recorded in the dataset. By comparing these two conditions, you can better understand how dramatically air quality can vary within the same neighborhood.

As time progresses, watch how PM two point five particles move through the street network. You may notice that pollution does not spread evenly. Instead, it follows urban pathways shaped by traffic corridors, building geometry, and airflow patterns.

Particles often accumulate at intersections, where vehicles slow down, stop, and accelerate. These locations can become hotspots of pollution exposure. Narrow streets and enclosed spaces may also trap particles, causing them to linger longer than in open areas.

At other times, you may observe pollution dispersing more quickly, thinning out as wind carries particles away. The changing sunlight in the scene indicates the passage of time throughout the day, helping you connect pollution levels to daily activity cycles.

Pay attention to how concentrations rise during certain periods and fall during others. Morning and evening peaks often correspond to commuting hours, while midday conditions may appear different depending on weather and atmospheric stability.

This dynamic visualization is designed to improve understanding of how pollution flows, accumulates, and fluctuates in urban environments. Rather than viewing air quality as a single number, you are seeing it as a living process shaped by both human activity and urban form.

Take a moment to explore this aerial view and observe how invisible environmental forces shape everyday life across the neighborhood.`,
  },
] as const;

export function chapterAt(time: number) {
  return TOUR_CHAPTERS.find((chapter) => time >= chapter.startTime && time < chapter.endTime) ?? TOUR_CHAPTERS.at(-1)!;
}

export function chapterHour(chapter: TourChapter, time: number) {
  const progress = Math.max(0, Math.min((time - chapter.startTime) / (chapter.endTime - chapter.startTime), 0.999999));
  return (chapter.startHour + Math.floor(progress * 24)) % 24;
}
