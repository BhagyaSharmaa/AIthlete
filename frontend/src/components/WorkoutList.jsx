// import React, { useEffect, useState } from "react";
// import { useUser } from "@clerk/clerk-react";

// const WorkoutList = () => {
//   const { user } = useUser();
//   const [workouts, setWorkouts] = useState([]);

//   useEffect(() => {
//     if (user) {
//       fetch(`/api/workouts?userId=${user.id}`)
//         .then((res) => res.json())
//         .then((data) => setWorkouts(data))
//         .catch((err) => console.error(err));
//     }
//   }, [user]);

//   if (!user) return <p>Loading user info...</p>;

//   return (
//     <div>
//       <h2>{user.firstName}'s Workouts</h2>
//       {workouts.length === 0 ? (
//         <p>No workouts found.</p>
//       ) : (
//         <ul>
//           {workouts.map((workout) => (
//             <li key={workout._id}>
//               <h4>{workout.title}</h4>
//               <p>{workout.description}</p>
//               <ul>
//                 {workout.exercises.map((ex, index) => (
//                   <li key={index}>
//                     {ex.name}: {ex.sets} sets x {ex.reps} reps
//                   </li>
//                 ))}
//               </ul>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default WorkoutList;
