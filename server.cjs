var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
var apiKey = process.env.GEMINI_API_KEY;
var ai = null;
if (apiKey) {
  ai = new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
} else {
  console.warn("Waring: GEMINI_API_KEY is not defined in environment variables. Gemini features will use standard offline fallbacks.");
}
app.use(import_express.default.json());
var leaderboard = [];
var objectives = [
  {
    id: "obj1",
    playerTarget: "Todos",
    description: "Completar 100 tiros libres anotados en total en Rutina de Tiro de Stephen Curry",
    category: "tiro",
    badge: "Francotirador de Verano",
    assignedBy: "Coach Miller (USA Academy)",
    targetCount: 100,
    currentCount: 40,
    deadline: "2026-06-15"
  },
  {
    id: "obj2",
    playerTarget: "Todos",
    description: "Mantener una racha del calendario de 5 d\xEDas seguidos de bote a toda velocidad",
    category: "bote",
    badge: "Rey del Crossover",
    assignedBy: "Coach Miller (USA Academy)",
    targetCount: 5,
    currentCount: 2,
    deadline: "2026-06-20"
  },
  {
    id: "obj3",
    playerTarget: "Todos",
    description: "Dominar la Resistencia con el Test de Suicidios de 17 tramos en menos de 55 segundos",
    category: "resistencia",
    badge: "Motor Incombustible",
    assignedBy: "Coach Miller (USA Academy)",
    targetCount: 1,
    currentCount: 0,
    deadline: "2026-06-25"
  }
];
app.get("/api/objectives", (req, res) => {
  res.json({ success: true, objectives });
});
app.post("/api/objectives", (req, res) => {
  const { description, category, badge, assignedBy, targetCount } = req.body;
  if (!description || !category || !targetCount) {
    return res.status(400).json({ success: false, error: "Faltan campos obligatorios para el objetivo" });
  }
  const newObjective = {
    id: "obj_" + Date.now(),
    playerTarget: "Todos",
    description,
    category,
    badge: badge || "Insignia Personalizada",
    assignedBy: assignedBy || "Entrenador Invitado",
    targetCount: Number(targetCount),
    currentCount: 0,
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0]
    // 15 días plazo
  };
  objectives.unshift(newObjective);
  res.json({ success: true, objectives });
});
app.post("/api/leaderboard/player", (req, res) => {
  const { name, avatar, points, drillsCompleted } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: "El nombre del jugador es requerido." });
  }
  const newPlayer = {
    id: "p_" + Date.now(),
    name: name.trim(),
    avatar: avatar || "\u{1F3C0}",
    points: points !== void 0 ? Number(points) : 0,
    drillsCompleted: drillsCompleted !== void 0 ? Number(drillsCompleted) : 0,
    lastActive: "\xA1Justo ahora!"
  };
  leaderboard.push(newPlayer);
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  res.json({ success: true, leaderboard: sortedLeaderboard });
});
app.get("/api/leaderboard", (req, res) => {
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  res.json({ success: true, leaderboard: sortedLeaderboard });
});
app.delete("/api/leaderboard/player/:id", (req, res) => {
  const { id } = req.params;
  leaderboard = leaderboard.filter((p) => p.id !== id);
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  res.json({ success: true, leaderboard: sortedLeaderboard });
});
app.post("/api/leaderboard/sync", (req, res) => {
  const { playerName, items } = req.body;
  if (!playerName || !items || !Array.isArray(items)) {
    return res.status(400).json({ success: false, error: "Datos de sincronizaci\xF3n inv\xE1lidos." });
  }
  let p = leaderboard.find((player) => player.name.toLowerCase() === playerName.toLowerCase());
  const pointsGained = items.reduce((acc, item) => acc + (item.points || 15), 0);
  const drillsGained = items.length;
  if (p) {
    p.points += pointsGained;
    p.drillsCompleted += drillsGained;
    p.lastActive = "\xA1Justo ahora!";
  } else {
    p = {
      id: "p_" + Date.now(),
      name: playerName,
      avatar: "\u2B50",
      points: 150 + pointsGained,
      // base 150 + synced points
      drillsCompleted: 5 + drillsGained,
      lastActive: "\xA1Justo ahora!"
    };
    leaderboard.push(p);
  }
  items.forEach((item) => {
    const category = item.category || "tiro";
    objectives.forEach((obj) => {
      if (obj.category === category && obj.currentCount < obj.targetCount) {
        obj.currentCount += 1;
      }
    });
  });
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  res.json({ success: true, leaderboard: sortedLeaderboard, syncedPoints: pointsGained, updatedObjectives: objectives });
});
app.post("/api/plan/generate", async (req, res) => {
  const {
    ageGroup,
    daysOfWeek,
    focusAreas,
    sessionDurationHours,
    customPrompt,
    weeksCount,
    playerRole,
    trainingMode,
    intensityLevel
  } = req.body;
  if (!ageGroup || !daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
    return res.status(400).json({ success: false, error: "Se requieren edad de jugadores y al menos un d\xEDa asignado." });
  }
  const selectedFocus = focusAreas && Array.isArray(focusAreas) && focusAreas.length > 0 ? focusAreas.join(", ") : "tiro, bote, agilidad, resistencia f\xEDsica y finalizaciones";
  const durationHours = sessionDurationHours ? Number(sessionDurationHours) : 2;
  const numWeeks = weeksCount ? Number(weeksCount) : 4;
  const roleText = playerRole === "shooter" ? "Enfoque Francotirador (Tiro, Catch & Shoot, Salidas de bloqueos)" : playerRole === "guard" ? "Desarrollo de Base / Escolta (Manejo de bal\xF3n, pick & roll y creaci\xF3n de juego estilo NBA/NCAA)" : playerRole === "big" ? "Juego de Poste / Pivote (Pivoteos, ganchos, rebote y mikan drill avanzado)" : "Equilibrado Todoterreno (Completo, todas las facetas)";
  const modeText = trainingMode === "duo" ? "Entrenamiento en Compa\xF1ero / Con Pasador (drills asistidos con alimentaci\xF3n de pase o defensa ligera)" : "Entrenamiento Individual (dise\xF1ado para un solo jugador con un bal\xF3n y la pista)";
  const intensityText = intensityLevel === "casual" ? "Intensidad Recreativa (Fundamentos relajados y mec\xE1nica de tiro fluida)" : intensityLevel === "elite" ? "Intensidad \xC9lite Prep / NCAA (Ritmo infernal con fatiga acumulada y metas de acierto altas)" : "Intensidad Competitiva Club (Nivel de entrenamiento de cantera formal)";
  const systemPrompt = `You are an expert American Basketball Coach specializing in summer development camps and Prep School training logic (NCAA / NBA skills trainer standard).
You speak fluent Spanish with an authentic, encouraging coaching tone.
Always adapt the training plan's drills and vocabulary strictly to the physical and cognitive development of the target age group:
- For '8-11' years old (Junior Infantil): Only use gamified, coordinate-based, playful drills (e.g., 'Crossover del Sem\xE1foro', 'Tiro de Jirafa'). Strictly prohibit high intensity physical conditioning like full-court suicides, weighted workouts, or high-fatigue setups. Focus on light body weight coordination. Intensity MUST be Low-to-Medium.
- For '12-14' years old (Cadete): Focus on basic transition flows, speed drills, moderate strength/bodyweight agility, and form shooting. Intensity is Medium.
- For '15-17' years old (Junior): Intense high school prep drills. Use high-volume shooting challenges, suicides, separation footwork, euro steps, and transitions. Intensity is Medium-to-High.
- For '18+' years old (Senior Pro): Elite college/pro training, maximum physical load (RPE 8-10), complex NBA movements, fadeaways, defensive coverage, and full speed drills. Intensity is High.

CRITICAL PROGRESI\xD3N DE DIFICULTAD Y VARIADORES ADICIONALES: Cada ejercicio (drill) propuesto en el plan de entrenamiento DEBE incluir en su descripci\xF3n una secci\xF3n obligatoria y sumamente detallada titulada "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n):". En esta secci\xF3n, detalla c\xF3mo evoluciona t\xE9cnicamente el ejercicio para evitar que sea repetitivo o mon\xF3tono. Por ejemplo:
- Si el ejercicio es de tiro y empieza recibiendo y tirando directo (Catch & Shoot), el nivel evolutivo debe pasar a a\xF1adir una finta de tiro (shot fake) seguida de un bote de escape lateral o una penetraci\xF3n explosiva hacia la canasta para tirar en parada de un tiempo o flotadora.
- Si es de bote est\xE1tico (como manejo con una mano), progresar\xE1 a meter botes en velocidad en zig-zag sobre conos con dos balones, fintas cruzadas o doble crossover r\xE1pido.
- Si es defensivo o agilidad, progresar\xE1 de deslizamiento lateral b\xE1sico a cambios dr\xE1sticos de caderas de 180\xB0, retrocesos coordinados a esprint y saltos con ca\xEDda isom\xE9trica balanceada.
Aplica esta regla de progresi\xF3n y crecimiento t\xE9cnico a absolutamente todos los ejercicios que propongas para el plan.

CRITICAL UNIQUE DRILLS RULE: Every single drill in the entire multi-week plan MUST have a completely unique name AND unique description containing the baseline drill instruction and its progressive evolution. You are strictly forbidden from reusing drill titles or pasting similar descriptions twice. Create technical variations for different weeks to ensure 100% variety.
Always output purely valid, clean JSON strings matching the requested JSONschema perfectly. DO NOT output any markdown blocks like \`\`\`json or backticks. Just output the raw JSON object.`;
  let weeksSpec = "";
  for (let w = 1; w <= numWeeks; w++) {
    weeksSpec += `"Semana ${w}", `;
  }
  weeksSpec = weeksSpec.slice(0, -2);
  const prompt = `Crea un plan de entrenamiento de baloncesto de verano personalizado de ${numWeeks} semanas de duraci\xF3n basado en las mejores rutinas de preparatoria estadounidense, con las siguientes caracter\xEDsticas:
- Edad de los jugadores: ${ageGroup} a\xF1os. ADAPTA COMPLETAMENTE la intensidad, tipo de ejercicios, vocabulario, metas y nivel de fatiga a este rango de edad. Bajo nivel f\xEDsico-metab\xF3lico para ni\xF1os (8-11) y m\xE1xima intensidad pro para adultos (18+).
- D\xEDas de la semana para entrenar cada semana: ${daysOfWeek.join(", ")}.
- \xC1reas de enfoque requeridas: ${selectedFocus}. El plan DEBE incluir un conjunto de ejercicios que cubran de manera equilibrada y obligatoria las \xE1reas de enfoque tradicionales (tiro, bote, agilidad, resistencia f\xEDsica y finalizaciones) y que ADEM\xC1S incorpore la categor\xEDa dedicada 'kobe' (ejercicios reales o inspirados directamente en la \xE9tica de trabajo de Kobe Bryant / Mamba Mentality).
- EQUILIBRIO DE METODOLOG\xCDA: No limites todo el plan \xFAnicamente a drills de Kobe Bryant. Mant\xE9n y utiliza los drills y metodolog\xEDas americanas tradicionales existentes para tiro, bote, agilidad, resistencia y finalizaciones (ej: entrenamientos estilo Curry, Kyrie, Prep Schools cl\xE1sicos), y simplemente a\xF1ade los drills espec\xEDficos de Kobe Bryant bajo la categor\xEDa/enfoque 'kobe'. Ambas metodolog\xEDas deben coexistir equilibradamente en cada semana de entrenamiento, garantizando que se apliquen todos los focos de forma balanceada.
- REQUISITO DE KOBE BRYANT (MAMBA MENTALITY): Bajo la categor\xEDa espec\xEDfica 'kobe', es de car\xE1cter obligatorio proponer excelentes ejercicios reales o directamente inspirados en Kobe Bryant (tales como: "Kobe's Sunset Elbow-to-Elbow Shooting", "Kobe Bryant 100-Make Challenge", "Kobe's Signature Fadeaway & Pivot", "Mamba 6-6-6 Speed Work", "Mamba Mentality Handle Challenge", "Kobe Footwork Layups"), explic\xE1ndolos al detalle en espa\xF1ol y nivel de ajuste acorde a la edad.
- REQUISITO DE ORIGINALIDAD EXTREMA (SIN REPETICIONES): Cada ejercicio (drill) propuesto en el plan de ${numWeeks} semanas DEBE ser completamente \xFAnico y exclusivo. No se permite repetir ning\xFAn t\xEDtulo de ejercicio ni descripci\xF3n en ninguna semana o d\xEDa. Inventa variaciones de ejercicios, combinaciones de fundamentos y mec\xE1nicas de entrenamiento progresivas para que no haya duplicaciones de ning\xFAn tipo. Cada d\xEDa tiene que proponer retos nuevos y t\xE9cnicos.
- NOMBRES DE LOS EJERCICIOS (MANDATORIO): Solo los ejercicios de la categor\xEDa espec\xEDfica 'kobe' deben llevar nombres relacionados con Kobe Bryant o Mamba Mentality. Los ejercicios de las dem\xE1s categor\xEDas ('tiro', 'bote', 'agilidad', 'resistencia', 'finalizaciones') DEBEN llevar sus nombres reales tradicionales, profesionales y aut\xE9nticos (ej: 'Stephen Curry Star Shooting', 'Kyrie Irving Handles', 'Classic Full-Court Suicides', 'Mikan Finishes Pro') y NO contener la palabra 'Kobe' o 'Mamba' en sus t\xEDtulos, reflejando fielmente el t\xEDtulo del ejercicio preciso que est\xE1s proponiendo.
- Duraci\xF3n total de cada sesi\xF3n de entrenamiento diaria: ${durationHours} horas (${durationHours * 60} minutos en total).
- Rol de Juego: ${roleText}.
- Formato: ${modeText}.
- Nivel de Intensidad: ${intensityText}.
- CONSTRICCI\xD3N CR\xCDTICA DE TIEMPO: Cada ejercicio propuesto en la lista de ejercicios (drills) DEBE durar obligatoria y estrictamente entre 10 y 15 minutos (por ejemplo, 10, 11, 12, 13, 14, 15 minutos). Nunca propongas ejercicios con duraciones mayores a 15 minutos ni menores a 10 minutos.
- Debes incluir suficientes ejercicios para cada d\xEDa (drills en la secuencia) de modo que la suma de sus 'durationMinutes' complete exactamente o de forma muy aproximada la duraci\xF3n de la sesi\xF3n diaria, es decir, ${durationHours * 60} minutos en total. Por ejemplo, si la duraci\xF3n total es de 2 horas (120 minutos), debes proponer aproximadamente 8-12 ejercicios diferentes de entre 10 y 15 minutos cada uno hasta sumar 120 minutos. El plan de entrenamiento DEBE detallar biomec\xE1nicas correctas (como mantener los codos alineados a 90 grados o bajar el centro de gravedad buscando estabilidad) tanto en la explicaci\xF3n como en los objetivos f\xEDsicos asignados. EN CADA EJERCICIO, explica primero la mec\xE1nica b\xE1sica del drill y luego a\xF1ade de forma obligatoria el bloque "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n):" ampliando el drill con fintas de tiro, desbordes, cambios de ritmo o penetraciones complejas para potenciar el repertorio del jugador.
- \xC9nfasis de cansancio e \xCDndice de Esfuerzo de Borg: incluye recomendaciones sobre el esfuerzo aer\xF3bico/anaer\xF3bico y metas de fatiga saludables para la edad.
${customPrompt ? `- INSTRUCCIONES ESPEC\xCDFICAS DE ADAPTACI\xD3N (CR\xCDTICO): El usuario ha solicitado expresamente la siguiente personalizaci\xF3n especial: "${customPrompt}". Adapta por completo el enfoque del plan, los tipos de ejercicios, la intensidad, progresi\xF3n e introducci\xF3n bas\xE1ndote en este requisito crucial.` : ""}

Genera un plan con ${numWeeks} semanas completas: de "Semana 1" a "Semana ${numWeeks}". Cada una con una tem\xE1tica de desarrollo semanal diferente.
Combina y secuencia de manera fluida y retadora ejercicios tradicionales americanos de primer nivel junto con la intensidad Mamba de los drills de Kobe Bryant.

El objeto JSON que devuelvas debe estructurarse obligatoriamente de la siguiente manera:
{
  "title": "Nombre profesional y emocionante del plan de ${numWeeks} semanas de duraci\xF3n",
  "description": "Una motivadora introducci\xF3n y contexto del plan (citando la influencia de entrenamientos de baloncesto de primer nivel, bajo el programa 'Pinetys Grind' adaptado para rol ${playerRole}, formato ${trainingMode} y nivel ${intensityLevel})",
  "recommendedWeeklyHours": (n\xFAmero estimado de horas de dedicaci\xF3n en una semana, ej: ${daysOfWeek.length * durationHours}),
  "weeks": [
    {
      "weekName": "Semana 1",
      "theme": "Enfoque principal o tema conductor de esta semana (ej: Dominio del Bal\xF3n y Fundamento)",
      "days": [
        {
          "dayName": "Nombre del d\xEDa de la semana que el usuario seleccion\xF3 de entre: ${daysOfWeek.join(", ")}",
          "theme": "Tema conductor americano para ese d\xEDa (ej. 'Ball Handling Speed & Transition')",
          "drills": [
            {
              "id": "identificador \xFAnico corto (p. ej. 'w1d1-d1', 'w1d1-d2')",
              "title": "Nombre aut\xE9ntico de la rutina de entrenamiento (ej. Mikan Finishes)",
              "category": "Una de las siguientes: 'tiro', 'bote', 'agilidad', 'resistencia', 'finalizaciones', 'kobe'",
              "description": "Explicaci\xF3n clara en espa\xF1ol de la mec\xE1nica, ejecuci\xF3n y posicionamiento del ejercicio, sin repetir descripciones previas",
              "durationMinutes": (un n\xFAmero entero obligatorio que debe estar ESTRICTAMENTE en el rango habitual de 10 a 15 minutos, de forma que el sumatorio de los ejercicios de este d\xEDa sea exactamente de ${durationHours * 60} minutos),
              "intensity": "Una de las siguientes: 'Baja', 'Media', 'Alta'",
              "targetReps": "Meta espec\xEDfica de la pr\xE1ctica, ideal para medirse (ej. 'Anotar 15 tiros consecutivos' o 'Completar 10 vueltas')",
              "assignedObjective": "Objetivo personalizado asignado por defecto para el jugador"
            }
          ]
        }
      ]
    }
  ]
}

Aseg\xFArate de que las ${numWeeks} semanas (${weeksSpec}) aparezcan detalladas, y que TODOS los d\xEDas seleccionados (${daysOfWeek.join(", ")}) figuren dentro de cada semana, con drills de entre 10 y 15 minutos cada uno secuenciados hasta completar la duraci\xF3n diaria y aplicando de forma balanceada y obligatoria todas las categor\xEDas indicadas.`;
  if (!ai) {
    console.log("No AI client. Serving fallback database plan.");
    return res.json({ success: true, plan: adaptMockPlan(ageGroup, daysOfWeek, durationHours, numWeeks, playerRole, trainingMode, intensityLevel, customPrompt) });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          required: ["title", "description", "recommendedWeeklyHours", "weeks"],
          properties: {
            title: { type: import_genai.Type.STRING },
            description: { type: import_genai.Type.STRING },
            recommendedWeeklyHours: { type: import_genai.Type.INTEGER },
            weeks: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                required: ["weekName", "theme", "days"],
                properties: {
                  weekName: { type: import_genai.Type.STRING },
                  theme: { type: import_genai.Type.STRING },
                  days: {
                    type: import_genai.Type.ARRAY,
                    items: {
                      type: import_genai.Type.OBJECT,
                      required: ["dayName", "theme", "drills"],
                      properties: {
                        dayName: { type: import_genai.Type.STRING },
                        theme: { type: import_genai.Type.STRING },
                        drills: {
                          type: import_genai.Type.ARRAY,
                          items: {
                            type: import_genai.Type.OBJECT,
                            required: ["id", "title", "category", "description", "durationMinutes", "intensity", "targetReps", "assignedObjective"],
                            properties: {
                              id: { type: import_genai.Type.STRING },
                              title: { type: import_genai.Type.STRING },
                              category: { type: import_genai.Type.STRING },
                              description: { type: import_genai.Type.STRING },
                              durationMinutes: { type: import_genai.Type.INTEGER },
                              intensity: { type: import_genai.Type.STRING },
                              targetReps: { type: import_genai.Type.STRING },
                              assignedObjective: { type: import_genai.Type.STRING }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        temperature: 0.8
      }
    });
    const outputText = response.text?.trim() || "";
    const parsedPlan = JSON.parse(outputText);
    return res.json({ success: true, plan: parsedPlan });
  } catch (error) {
    console.error("Gemini Generation Error, falling back to clean static generation:", error);
    return res.json({ success: true, plan: adaptMockPlan(ageGroup, daysOfWeek, durationHours, numWeeks, playerRole, trainingMode, intensityLevel, customPrompt) });
  }
});
app.post("/api/plan/analyze", async (req, res) => {
  const { plan, ageGroup, playerRole, trainingMode, intensityLevel, completedCount = 0 } = req.body;
  if (!plan) {
    return res.status(400).json({ success: false, error: "El plan es requerido para ser analizado." });
  }
  let boteCount = 0;
  let tiroCount = 0;
  let resistenciaCount = 0;
  let agilidadCount = 0;
  let finalizacionesCount = 0;
  let kobeCount = 0;
  let totalDrills = 0;
  plan.weeks?.forEach((week) => {
    week.days?.forEach((day) => {
      day.drills?.forEach((drill) => {
        totalDrills++;
        const cat = (drill.category || "").toLowerCase();
        if (cat === "bote") boteCount++;
        else if (cat === "tiro") tiroCount++;
        else if (cat === "resistencia") resistenciaCount++;
        else if (cat === "agilidad") agilidadCount++;
        else if (cat === "finalizaciones") finalizacionesCount++;
        else if (cat === "kobe") kobeCount++;
      });
    });
  });
  const botePercent = totalDrills > 0 ? Math.round(boteCount / totalDrills * 100) : 0;
  const tiroPercent = totalDrills > 0 ? Math.round(tiroCount / totalDrills * 100) : 0;
  const resistenciaPercent = totalDrills > 0 ? Math.round(resistenciaCount / totalDrills * 100) : 0;
  const agilidadPercent = totalDrills > 0 ? Math.round(agilidadCount / totalDrills * 100) : 0;
  const finalizacionesPercent = totalDrills > 0 ? Math.round(finalizacionesCount / totalDrills * 100) : 0;
  const kobePercent = totalDrills > 0 ? Math.round(kobeCount / totalDrills * 100) : 0;
  const getMockAnalysis = () => {
    let baseScore = 40;
    if (intensityLevel === "Bajo") baseScore = 30;
    else if (intensityLevel === "Moderado") baseScore = 55;
    else if (intensityLevel === "\xC9lite Prep") baseScore = 80;
    const score = Math.min(100, Math.max(20, baseScore + resistenciaCount * 5 + kobeCount * 6 - (ageGroup?.includes("U12") ? 12 : 0)));
    let intensityLabel = `Intensidad Moderada (RPE 5-6) para ${playerRole || "Monejo Bal\xF3n"}`;
    if (score > 75) intensityLabel = `Intensidad \xC9lite Prep / Alta Carga (RPE 8-10) para ${playerRole || "Monejo Bal\xF3n"}`;
    else if (score < 50) intensityLabel = `Intensidad Recreativa / Baja Carga (RPE 3-4) para ${playerRole || "Monejo Bal\xF3n"}`;
    let critique = `Evaluaci\xF3n biomec\xE1nica adaptada para un perfil de rol "${playerRole || "Jugador"}" y categor\xEDa de edad "${ageGroup || "General"}". `;
    critique += `Se analiza una sesi\xF3n estival con ${totalDrills} ejercicios dise\xF1ados. `;
    if (completedCount > 0) {
      critique += `Has completado exitosamente ${completedCount} ejercicios, estimulando la adaptaci\xF3n muscular y la memoria propioceptiva. `;
    } else {
      critique += `Comienza a registrar tus ejercicios completados para ver el impacto biol\xF3gico real de la sesi\xF3n. `;
    }
    critique += `La distribuci\xF3n cuenta con un ${botePercent}% de bote, ${tiroPercent}% de tiro a canasta, y un ${resistenciaPercent}% de acondicionamiento de alta potencia. `;
    if (ageGroup?.includes("U12") || ageGroup?.includes("Infantil")) {
      critique += "En este rango infantil, la atenci\xF3n se centra en la coordinaci\xF3n general de la zancada y el cuidado contra la fatiga de sobre\xFAso articular precoz.";
    } else {
      critique += "Apto para el desarrollo del \xE1cido l\xE1ctico controlado y el fortalecimiento rotuliano mediante repeticiones mec\xE1nicas seguras.";
    }
    const recommendations = [
      `Foco de Postura (${playerRole || "Jugador"}): Mant\xE9n el torso bien erguido al driblear para optimizar tu campo de visi\xF3n perif\xE9rica.`,
      `Prevenci\xF3n de Tirador: Con un ${tiroPercent}% de volumen de tiro, estira los deltoides y flexores de mu\xF1eca para prevenir tendinitis estivales.`,
      `Biomec\xE1nica de Pisada: En las series explosivas, aterriza con suavidad en metatarsos amortiguando la flexi\xF3n de rodilla para proteger tendones.`
    ];
    return {
      intensityScore: score,
      intensityLabel,
      balance: {
        bote: botePercent,
        tiro: tiroPercent,
        resistencia: resistenciaPercent,
        agilidad: agilidadPercent,
        finalizaciones: finalizacionesPercent,
        kobe: kobePercent
      },
      critique,
      recommendations
    };
  };
  if (!ai) {
    console.log("No AI client available for analyze. Serving fallback analysis.");
    return res.json({ success: true, analysis: getMockAnalysis() });
  }
  try {
    const systemPromptMessage = `You are an expert American Basketball Coach, Biomechanics Specialist and Athletic Trainer specializing in physical load, intensity metrics, sports medicine, joint health, and training balance analysis (NCAA and NBA skills training standard).
You speak fluent Spanish with an encouraging, highly professional coaching tone.
Your task is to analyze the training plan provided, taking into account the player's biographical and active workout stats, and output a structured JSON analysis indicating the exact physical balance and fatigue expectations. Be highly precise, clinical but motivating. Avoid generic fluff.`;
    const promptText = `Analiza el siguiente plan de entrenamiento de baloncesto y calcula su equilibrio t\xE9cnico y nivel de intensidad f\xEDsica para:
- Nombre / Perfil de Jugador: ${plan.title || "Personalizado"}
- Categor\xEDa de Edad: ${ageGroup || "No especificado"}
- Rol t\xE1ctico del Jugador: ${playerRole || "No especificado"}
- Modo de Entrenamiento: ${trainingMode || "No especificado"}
- Nivel de Intensidad Objetivo: ${intensityLevel || "No especificado"}
- Ejercicios ya completados en esta sesi\xF3n: ${completedCount || 0} de ${totalDrills} entrenamientos totales.

Plan Completo a evaluar: ${JSON.stringify(plan)}

De un total de ${totalDrills} ejercicios planificados:
- Bote: ${boteCount} drills (${botePercent}%)
- Tiro: ${tiroCount} drills (${tiroPercent}%)
- Resistencia: ${resistenciaCount} drills (${resistenciaPercent}%)
- Agilidad: ${agilidadCount} drills (${agilidadPercent}%)
- Finalizaciones: ${finalizacionesCount} drills (${finalizacionesPercent}%)
- Enfoque Mamba (Kobe): ${kobeCount} drills (${kobePercent}%)

Por favor, genera un an\xE1lisis biometrol\xF3gico riguroso, motivador y personalizado en espa\xF1ol adaptado espec\xEDficamente a su edad (${ageGroup}) y rol (${playerRole}). 
En 'critique', proporciona de 3 a 5 l\xEDneas con consideraciones cient\xEDficas sobre sus niveles de lactato, fatiga neuromuscular y biomec\xE1nica (por ejemplo, fatiga del manguito rotador para tiradores, o cuidado articular para p\xEDvots).
En 'recommendations', redacta exactamente 3 consejos biomec\xE1nicos personalizados pr\xE1cticos y aplicables de recuperaci\xF3n o postura para evitar lesiones de verano.
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPromptMessage,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          required: ["intensityScore", "intensityLabel", "balance", "critique", "recommendations"],
          properties: {
            intensityScore: {
              type: import_genai.Type.INTEGER,
              description: "Calificaci\xF3n num\xE9rica del nivel de carga f\xEDsica, de 0 a 100"
            },
            intensityLabel: {
              type: import_genai.Type.STRING,
              description: "Etiqueta descriptiva del tipo de intensidad (ej: 'Intensidad \xC9lite Prep / RPE Alta' o 'Junior Moderado')"
            },
            balance: {
              type: import_genai.Type.OBJECT,
              required: ["bote", "tiro", "resistencia", "agilidad", "finalizaciones", "kobe"],
              properties: {
                bote: { type: import_genai.Type.INTEGER },
                tiro: { type: import_genai.Type.INTEGER },
                resistencia: { type: import_genai.Type.INTEGER },
                agilidad: { type: import_genai.Type.INTEGER },
                finalizaciones: { type: import_genai.Type.INTEGER },
                kobe: { type: import_genai.Type.INTEGER }
              }
            },
            critique: {
              type: import_genai.Type.STRING,
              description: "Breve comentario t\xE9cnico y motivador de 3 a 5 l\xEDneas sobre el equilibrio entre los ejercicios de bote, tiro, resistencia y enfoque mamba."
            },
            recommendations: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING },
              description: "Lista de 3 observaciones o consejos pr\xE1cticos de biomec\xE1nica o recuperaci\xF3n para abordar este plan espec\xEDfico."
            }
          }
        },
        temperature: 0.7
      }
    });
    const outputText = response.text?.trim() || "";
    const parsedAnalysis = JSON.parse(outputText);
    return res.json({ success: true, analysis: parsedAnalysis });
  } catch (error) {
    console.error("Gemini analysis error, using fallback analysis:", error);
    return res.json({ success: true, analysis: getMockAnalysis() });
  }
});
app.post("/api/drill/suggest", async (req, res) => {
  const { focusArea, intensityLevel, ageGroup, playerRole } = req.body;
  const selectedFocus = focusArea || "tiro";
  const intensityLabel = intensityLevel === "casual" ? "Baja" : intensityLevel === "elite" ? "Alta" : "Media";
  const getMockDrill = () => {
    return {
      id: "suggested-" + Date.now(),
      title: `Especializado en ${selectedFocus.toUpperCase()} Grind`,
      category: selectedFocus,
      description: `Un ejercicio sugerido personalizado para la mejora en ${selectedFocus} adaptado a un nivel de intensidad ${intensityLabel}. Enf\xF3cate en mantener el codo alineado a 90 grados, zancada balanceada y bajando el centro de gravedad. \u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): A\xF1ade fintas r\xE1pidas o cambios de direcciones impredecibles.`,
      durationMinutes: 12,
      intensity: intensityLabel,
      targetReps: "Repetir 4 series de 8 aciertos perfectos.",
      assignedObjective: `Controlar la estabilidad y biomec\xE1nica en cada paso.`
    };
  };
  if (!ai) {
    console.log("No AI client available. Serving fallback suggested drill.");
    return res.json({ success: true, drill: getMockDrill() });
  }
  try {
    const systemPromptMessage = `You are an expert American Basketball Coach and Athletic Trainer specializing in summer development camps and Prep School skill training (NCAA & NBA standard).
You speak fluent Spanish with an encouraging and high-performance coaching voice.
Your task is to suggest ONE highly specialized, professional basketball drill and return it in a structured JSON.`;
    const promptText = `Sugiere un \xFAnico y innovador ejercicio (drill) de baloncesto personalizado en espa\xF1ol:
- \xC1rea de enfoque: ${selectedFocus} ('tiro', 'bote', 'agilidad', 'resistencia', 'finalizaciones' o 'kobe')
- Intensidad de entrenamiento: ${intensityLevel} (intensidad del ejercicio recomendada: '${intensityLabel}')
- Edad o categor\xEDa del jugador: ${ageGroup || "15-17"} a\xF1os
- Rol de juego: ${playerRole || "all-round"}

REQUISITO CR\xCDTICO DE EVOLUCI\xD3N COMPORTAMENTAL:
En la 'description' del ejercicio, detalla los pasos de ejecuci\xF3n t\xE9cnica de forma emocionante e incorpora obligatoriamente una secci\xF3n titulada "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n):" en espa\xF1ol explicando detalladamente un reto adicional para llevar el ejercicio al siguiente nivel. El ejercicio debe ser estimulante y estar adaptado a este contexto veraniego.
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPromptMessage,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          required: ["id", "title", "category", "description", "durationMinutes", "intensity", "targetReps", "assignedObjective"],
          properties: {
            id: { type: import_genai.Type.STRING },
            title: { type: import_genai.Type.STRING, description: "Nombre aut\xE9ntico de la rutina de entrenamiento en espa\xF1ol" },
            category: { type: import_genai.Type.STRING, description: "Categor\xEDa exacta del ejercicio" },
            description: { type: import_genai.Type.STRING, description: "Explicaci\xF3n clara de la ejecuci\xF3n con su bloque de Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n)" },
            durationMinutes: { type: import_genai.Type.INTEGER, description: "Duraci\xF3n en minutos (por ejemplo, entre 10 y 15)" },
            intensity: { type: import_genai.Type.STRING, description: "Intensidad: 'Baja', 'Media', o 'Alta'" },
            targetReps: { type: import_genai.Type.STRING, description: "Meta cuantitativa de aciertos, repeticiones o series" },
            assignedObjective: { type: import_genai.Type.STRING, description: "Objetivo biomec\xE1nico asignado" }
          }
        },
        temperature: 0.85
      }
    });
    const outputText = response.text?.trim() || "";
    const parsedDrill = JSON.parse(outputText);
    parsedDrill.id = "suggested-" + Date.now();
    return res.json({ success: true, drill: parsedDrill });
  } catch (error) {
    console.error("Gemini suggest drill API error, using fallback format:", error);
    return res.json({ success: true, drill: getMockDrill() });
  }
});
function adaptMockPlan(ageGroup, daysOfWeek, sessionDurationHours, weeksCount, playerRole, trainingMode, intensityLevel, customPrompt) {
  const hours = sessionDurationHours ? Number(sessionDurationHours) : 2;
  const totalMinutes = hours * 60;
  const numWeeks = weeksCount ? Number(weeksCount) : 4;
  const role = playerRole || "all-round";
  const mode = trainingMode || "solo";
  const level = intensityLevel || "medium";
  let mappedAge = "18+";
  let rpeRange = "8-10 (Muy fuerte / Esfuerzo m\xE1ximo pro)";
  let categoryIntensity = "Alta/\xC9lite";
  let postureTip = "Mant\xE9n la posici\xF3n defensiva baja sosteniendo un centro de gravedad extremadamente bajo para ganar empuje lateral.";
  let shootingTip = "Mec\xE1nica alineada con el codo elevado estrictamente a 90 grados al armar y lanzar el bal\xF3n.";
  if (ageGroup.includes("8") || ageGroup.includes("9") || ageGroup.includes("10") || ageGroup.includes("11")) {
    mappedAge = "8-11";
    rpeRange = "3-5 (L\xE1ctico suave, divertido, coordinativo)";
    categoryIntensity = "Baja/Coordinativa";
    postureTip = "Enfocarse en un juego alegre y mantener caderas flexionadas de forma natural con centro de gravedad compensado.";
    shootingTip = "Acostumbrar el tiro de mu\xF1eca suave dibujando una jirafa apuntando con el codo alto a unos 90 grados.";
  } else if (ageGroup.includes("12") || ageGroup.includes("13") || ageGroup.includes("14")) {
    mappedAge = "12-14";
    rpeRange = "5-7 (Moderado a fuerte, aer\xF3bico mixto)";
    categoryIntensity = "Media/Desarrollo";
    postureTip = "Postura b\xE1sica defensiva est\xE1ndar, bajando el centro de gravedad buscando estabilidad en traslados de banda.";
    shootingTip = "Estructurar la trayectoria vertical, manteniendo el codo fijado a 90 grados en la preparaci\xF3n del canasto.";
  } else if (ageGroup.includes("15") || ageGroup.includes("16") || ageGroup.includes("17")) {
    mappedAge = "15-17";
    rpeRange = "7-9 (Fuerte, anaer\xF3bico l\xE1ctico preparatorio)";
    categoryIntensity = "Alta/Competitiva";
    postureTip = "Bajar el centro de gravedad por debajo de las caderas con hombros hacia adelante listos para reaccionar al cambio.";
    shootingTip = "Fijar el arco de tiro arriba, bloqueando el codo a un \xE1ngulo exacto de 90 grados soportando la fatiga acumulada.";
  }
  const baseThemes = [
    "Dominio de Fundamentos B\xE1sicos y Control T\xE9cnico de Bal\xF3n",
    "Mec\xE1nica del Tiro de Precisi\xF3n y Desmarques R\xE1pidos",
    "Agilidad de Reacci\xF3n, Desplazamientos y Posici\xF3n de Resistencia",
    "Alta Frecuencia Cardiaca, Toma de Decisiones y Presi\xF3n F\xEDsica",
    "Lectura T\xE1ctica de Espacios, Bloqueo de Bal\xF3n y Apoyos Estables",
    "Ataques en Transici\xF3n Veloz, Espaciados y Cambios de Ritmo",
    "Control de Pelotas en Doble Presi\xF3n y Contraataques R\xE1pidos",
    "Temple Mental en Instantes Cr\xEDticos y Simulaciones de Partido"
  ];
  const bases = {
    tiro: {
      titles: [
        "Stephen Curry Range Focus",
        "Catch & Shoot R\xE1pido de Esquina",
        "V-Cut & Square Up Jumper",
        "Elbow-to-Elbow Touch Jumper",
        "Spot-Up Jumper Perimetral",
        "Step-Back de Separaci\xF3n Lateral",
        "Pull-Up Pro tras Drible",
        "Lanzamiento de Form Shooting Vertical",
        "Tiro en Suspensi\xF3n con Elevaci\xF3n Corta",
        "Ray Allen Screen Lift Jumper",
        "Klay Thompson Corner Special",
        "Lanzamiento de Tres en Fatiga Extrema",
        "Elevaci\xF3n de Bloqueo Ciego",
        "Form Shooting Directo de Tablero",
        "Catch & Release Angular de Fase",
        "Reggie Miller Corner Off-Screen Jumper",
        "Steve Nash Pull-Up on the Run",
        "Decelerando en Cono Jumper",
        "Fadeaway Lateral Estilo Kevin Durant",
        "Stephen Curry Star Out Series"
      ],
      details: [
        "atendiendo la tracci\xF3n de los metatarsos con codos fijos a 90 grados",
        "alineando con precisi\xF3n quir\xFArgica el hombro dominante directo con el medio del aro",
        "con extensi\xF3n e impulsi\xF3n uniforme del codo terminando con un mu\xF1equeo suave de seda",
        "plantando firmemente los apoyos en paralelo bajo los hombros para una ca\xEDda estable",
        "sosteniendo el balance de espalda erguida evitando balanceos perjudiciales de cadera"
      ],
      actions: [
        "amortiguar la recepci\xF3n con punta de pies y tirar de inmediato",
        "cortar el per\xEDmetro en esprint corto, clavar el pivote gu\xEDa y elevar el cuerpo",
        "ejecutar un amago t\xE9cnico de desmarque para un tiro r\xE1pido en suspensi\xF3n",
        "encestar de forma fluida manteniendo la punta de los dedos colgando al final del vuelo"
      ]
    },
    bote: {
      titles: [
        "Kyrie Irving Handle Combo",
        "Bote de Bolsillo (Pocket Dribble)",
        "In-and-Out & Crossover Pro",
        "Bote de Control Ultra Bajo",
        "Manejo de Bal\xF3n Alternado en Tensi\xF3n",
        "Zig-Zag Handles con Pivot",
        "Cambios Shifty con Amago de Hombros",
        "Dribling de Salida Defensiva de Presi\xF3n",
        "Spider Handles con Ritmo Sincopado",
        "Crossover entre Piernas Explosivo",
        "Bote de Retroceso T\xE9cnico",
        "Manejo Lateral de Bal\xF3n en Desplazamiento",
        "Low-Drive Dribbling de Rotura",
        "Bote Cruzado de Escape Corto",
        "Cambios Estilo Base Armador",
        "Kyrie Irving Shifty Dribble",
        "Steve Nash Wrap-Around",
        "Chris Paul Pocket Cross",
        "Deron Williams Crossover Challenge",
        "Luka Doncic Step-Back Handle"
      ],
      details: [
        "bajando la posici\xF3n centro-de-gravedad por debajo del nivel est\xE1ndar de cadera",
        "golpeando con firmeza el esf\xE9rico utilizando exclusivamente la yema de las manos",
        "sosteniendo el torso en tensi\xF3n con cabeza arriba leyendo el tablero",
        "hundiendo el perfil de la bota contra el parqu\xE9 para arranques inmediatos",
        "controlando la cobertura esclava del bal\xF3n usando el antebrazo opuesto activo"
      ],
      actions: [
        "rebotar el cuero fuertemente contra el piso para maximizar el tiempo de reacci\xF3n",
        "alternar alturas de pique forzando la p\xE9rdida de equilibrio virtual del rival",
        "ejecutar crossovers continuos combinados con fintas de entrada y salida",
        "proteger el bal\xF3n en giros cerrados amagando desbordes sobre la l\xEDnea"
      ]
    },
    agilidad: {
      titles: [
        "Escalera de Coordinaci\xF3n Ickey Shuffle",
        "Deslizamientos de Espejo en Conos de L\xEDmite",
        "Pivote Reverso y Cambio",
        "Circuito de Estrella de 5 Conos",
        "Reaction Shuffle Defensivo de Banda",
        "Paso de Tijera en Escalera de Ritmo",
        "Freno de un Tiempo en Parada Seca",
        "Hips-Switch de Giro de Rodillas",
        "Laterales de Tensi\xF3n Defensiva Cruzada",
        "Pivote de Fuerza y Escape de Bloqueo",
        "Circuito Slalom de Conos de Conexi\xF3n",
        "Reaction Drill Multi-Target",
        "Desplazamiento Escalonado de Vallas Cortas",
        "Giro Tridimensional de Caderas",
        "Puntas de Fuego en Eje Frontal",
        "Ladder High-Knees Sprint",
        "Cone Weave and Hip Swivel Drill",
        "L-Drill Transition Speed Challenge",
        "W-Drill Defensive Shuffler"
      ],
      details: [
        "distribuyendo el centro de gravedad buscando estabilidad defensiva total",
        "afianzando los pies con resortes coordinativos sin tocar los divisores",
        "disipando la carga cin\xE9tica flexionando con seguridad rodillas y espalda",
        "abriendo el comp\xE1s de brazos para simular cobertura defensiva asfixiante",
        "manteniendo cadencia isom\xE9trica para anticipar desbordes del atacante"
      ],
      actions: [
        "ejecutar pasadas r\xEDtmicas veloces tocando con precisi\xF3n quir\xFArgica los rect\xE1ngulos",
        "pivotar en un eje de 180 grados resguardando el hombro de contenci\xF3n",
        "variar de direcci\xF3n s\xFAbitamente tras la se\xF1al virtual del silbato",
        "deslizarse lateralmente empujando con la pierna retrasada para no cruzar tobillos"
      ]
    },
    resistencia: {
      titles: [
        "Test de Suicidios Cl\xE1sicos de Cantera",
        "Esprints Aro a Aro en Transici\xF3n",
        "Intervalo Mamba 40/20 de Fatiga",
        "Carrera Continua de Resistencia de Partido",
        "Esprints Perimetrales con Cambios del Silbato",
        "Resistencia L\xE1ctica de Cierre de Per\xEDodo",
        "Sprints de Retroceso Defensivo",
        "Circuito L\xE1ctico Prep School",
        "Suicidas de Cancha Completa con Freno",
        "L\xEDnea a L\xEDnea Suicidas de Velocidad",
        "Intervalos de Recuperaci\xF3n Activa",
        "Carrera de Conos en Zig-Zag Continuo",
        "Esprint de Ida y Vuelta con Autopase",
        "Intervalo Mamba de Desborde Continuo",
        "Resistencia de Presi\xF3n Defensiva de Cancha Llena",
        "17-In-A-Minute Baseline Sprint",
        "Gasser Side-to-Side Endurance",
        "Full-Court In-and-Out Reps",
        "Interval 35/15 Mamba Attack"
      ],
      details: [
        "administrando la oxigenaci\xF3n mediante ciclos profundos de respiraci\xF3n nasal",
        "regulando la carga de esfuerzo de acuerdo a la escala RPE Borg \xF3ptima",
        "ejecutando zancadas fluidas balanceando din\xE1micamente los brazos contra el torso",
        "cayendo de forma el\xE1stica sobre los metatarsos para proteger las rodillas de impactos",
        "manteniendo la compostura f\xEDsica a pesar de la acumulaci\xF3n de fatiga l\xE1ctica"
      ],
      actions: [
        "realizar esprints al tope de tu capacidad mec\xE1nica dominando el cansancio mental",
        "completar vueltas continuas sosteniendo un paso uniforme y erguido de juego",
        "recuperar aire trotando de espaldas con la mirada puesta en el aro opuesto",
        "romper el ritmo con esprints explosivos de cono a cono deteniendo la carrera en seco"
      ]
    },
    finalizaciones: {
      titles: [
        "Mikan Drill R\xEDtmico Tradicional",
        "Flotadora de Bombeo Alto",
        "Euro Step Explosivo en Pintura",
        "Entrada en Reverso de Tablero Pro",
        "Bandeja de Choque en Doble Ritmo",
        "Parada de Dos Tiempos & Up-and-Under",
        "Finger-roll Sutil de Toque Alto",
        "Gancho Corto en Poste de Pivote",
        "Bandeja Pasada Invertida al Aro",
        "Mikan Drill Inverso de Fuerza",
        "Finalizaci\xF3n de Flotadora con Finta",
        "Euro-Step Cruzado con Finta de Pase",
        "Drop-Step de Fuerza en Poste Bajo",
        "Mikan Drill de Dos Balones Sincronizados",
        "Entrada Acrob\xE1tica tras Euro-Step de Reverso",
        "Tony Parker Floater Series",
        "Bandeja de Fuerza con Choque de Escudo",
        "Ginobili Euro-Step Extension",
        "Rondo Fake Behind-Back Jumper"
      ],
      details: [
        "estabilizando el bal\xF3n pegado al pecho con codos salientes de barrera",
        "amortiguando el peso en dos pies de forma conjunta para disipar forces de choque",
        "estirando el brazo atacante cerca de la esquina negra del cristal superior",
        "manteniendo el cuerpo firme suspendido para contrarrestar el contacto f\xEDsico virtual",
        "depositando el bal\xF3n suavemente con las yemas para propiciar un rebote favorable"
      ],
      actions: [
        "encestar con toque d\xF3cil permitiendo que el cuero acaricie el parqu\xE9 limpiamente",
        "atacar el poste con zancadas anchas y eludir los bloqueos de brazos defensivos",
        "conducir la rodilla arriba con ferocidad para propulsar el salto vertical",
        "concluir con un gancho corto arqueando el esf\xE9rico por encima del defensor"
      ]
    },
    kobe: {
      titles: [
        "Kobe Bryant Sunset Elbow Shooting",
        "Kobe 100-Make Workout",
        "Mamba 6-6-6 Speed Work",
        "Signature Fadeaway & Pivot Challenge",
        "Mamba Handle Challenge de Tensi\xF3n",
        "Kobe Footwork Layups Series",
        "Mamba Mentality Triple Threat",
        "Mamba Focus de Silbato de Hierro",
        "Kobe Bryant Mid-Post Fadeaway",
        "Kobe Bryant Sunset Elbow-to-Elbow Shooting Challenge",
        "Mamba Mentality Elite Handle",
        "Sunset Elbow Jumper Bryant Style",
        "Kobe Bryant Double Clutch Attack",
        "Mamba Focus con Fatiga Acumulada",
        "Fadeaway de Fuerza Estilo Kobe",
        "Kobe Sunset Low Post Pivot",
        "Signature Shot-Fake and Jumper",
        "Sunset Triple Threat Attack"
      ],
      details: [
        "canalizando la legendaria e incansable mentalidad Mamba de excelencia sin l\xEDmites",
        "sosteniendo de manera obligatoria el codo alineado a un \xE1ngulo exacto de 90 grados",
        "empujando las fronteras del cansancio para pulir decisiones t\xE9cnicas en instantes decisivos",
        "perfeccionando la coordinaci\xF3n de apoyos con pivotes precisos en el poste medio",
        "recreando el escenario m\xEDtico con el reloj de juego expirando en cada tiro"
      ],
      actions: [
        "despachar un fadeaway suspendido ladeando con gracia el torso hacia atr\xE1s",
        "ejecutar un lanzamiento de media distancia inmutable ante la inercia f\xEDsica",
        "sostener el bote protegiendo con el hombro para clavar un quiebre de mu\xF1eca definitivo",
        "clavar tiros consecutivos de media distancia sin permitirse ning\xFAn fallo t\xE9cnico"
      ]
    }
  };
  const evolutions = {
    tiro: [
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con disparo est\xE1tico Catch & Shoot; evoluciona a\xF1adiendo una finta de tiro explosiva (shot fake), bote lateral largo de escape y suspensi\xF3n inmediata estabilizando el codo.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia viniendo de corte en V r\xE1pido; evoluciona a finta de tiro perimetral, penetraci\xF3n de dos botes con cambio de mano y lanzamiento flotador (floater) de bombeo alto para eludir el p\xEDvot defensor.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia saliendo de bloqueo ciego; evoluciona a\xF1adiendo un paso de step-back con amago de hombros lateral para crear separaci\xF3n m\xE1xima de la marca antes del salto.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con tiro directo tras drible; evoluciona a finta t\xE9cnica de tiro, penetraci\xF3n explosiva cruzada por l\xEDnea de fondo, freno seco en un tiempo, pivote reverso de 180\xB0 y suspensi\xF3n estable."
    ],
    bote: [
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con pique de control bajo est\xE1tico; evoluciona a drible en zig-zag sobre 4 conos introduciendo cambios cruzados de mano continuos in-and-out a velocidad de partido.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con crossover simple est\xE1tico; evoluciona a doble cambio r\xE1pido (entre piernas y por detr\xE1s) seguido de un arranque explosivo protegiendo el bal\xF3n con el antebrazo activo.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con bote alternativo continuo; evoluciona agregando finta de salida directa con hombros, retroceso de bolsillo de control (pocket dribble) y escape veloz cruzado.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con dribling normal; evoluciona simulando doble marca de trampa (trap), retrocediendo con botes de poder bajos y lanzando una finta de pase armada antes de atacar el eje opuesto."
    ],
    agilidad: [
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con paso lateral r\xEDtmico; evoluciona a deslizamientos laterales explosivos tocando las marcas del suelo con las puntas, rotando caderas a 180\xB0 y esprintando de espaldas.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con esprint lineal corto; evoluciona a circuito de slalom incorporando frenos secos isom\xE9tricos de un tiempo y saltos altos con los dos pies simulando un tap\xF3n perimetral.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con saltos en escalera; evoluciona a saltos bipodales r\xE1pidos front-to-back con salida de esprint lateral explosivo e inmediato reaccionando al silbato virtual.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con pasos cortos de reacci\xF3n; evoluciona a giros tridimensionales de caderas para cruzar el eje entre conos paralelos manteniendo el centro de gravedad por debajo de las caderas."
    ],
    resistencia: [
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con carrera regular aro a aro; evoluciona a suicidas completos cronometrados bajando la marca a menos de 30 segundos, sumando flexiones de pecho veloces al rozar cada l\xEDnea l\xEDmite.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con trote perimetral aer\xF3bico; evoluciona a pasadas intermitentes Mamba 40/20 combinando saltos pliom\xE9tricos de rodillas al pecho (tuck jumps) antes de romper cada carrera.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con velocidad de pista completa; evoluciona a esprints de aro a aro autopasando el bal\xF3n con el cristal superior, saltando al m\xE1ximo para atrapar el rebote a dos manos arriba con fatiga.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con resistencia defensiva est\xE1tica; evoluciona a esprints de retroceso defensivo en flexi\xF3n de rodillas continua combatiendo el dolor muscular de fatiga l\xE1ctica activa."
    ],
    finalizaciones: [
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con bandeja cl\xE1sica por la derecha; evoluciona a penetraci\xF3n de choque lateral con finta de canasta alta por el perfil izquierdo, eurostep largo de dos metros y remate pasado invertido.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con gancho corto est\xE1tico; evoluciona a pivoteo de fuerza en poste bajo, amago alto de tiro en suspensi\xF3n ('up and under') y lanzamiento arqueado de gancho cruzado sobre el defensor.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con mikan r\xEDtmico tradicional; evoluciona a mikan invertido de alta frecuencia alternando balones sin tocar el parqu\xE9 y suspensi\xF3n isom\xE9trica con una sola pierna.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con entrada limpia en doble ritmo; evoluciona a penetraci\xF3n resistiendo el impacto lateral del defensor defensivo, doblando el aire en doble embrague (double clutch) para rematar con tablero."
    ],
    kobe: [
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con tiro suspendido en el poste; evoluciona a recibir de espaldas bajo marca f\xEDsica, ejecutar pivote al poste medio con fadeaway suspendido ladeando el torso y arqueando los hombros.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con mamba handle b\xE1sico; evoluciona a finta de salida cruzada con hombros, step-back r\xE1pido a media distancia, finta de tiro en la elevaci\xF3n, avance invertido de un bote y tiro final.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con bandeja kobe acrob\xE1tica; evoluciona a doble finta de tiro en la botella de la pintura, juego de pies r\xE1pido de paso reverso cruzado y gancho corto flotador bajo fatiga acumulada.",
      "\u{1F504} Progresi\xF3n e Incremento de Dificultad (Evoluci\xF3n): Inicia con lanzamientos a media distancia; evoluciona a esprintar al codo contrario (codo-a-codo) tocando el madero, recoger pase en autopase en suspensi\xF3n alta y penetrar con finta antes de elevarse."
    ]
  };
  const categories = ["agilidad", "bote", "tiro", "finalizaciones", "resistencia", "kobe"];
  const weeks = Array.from({ length: numWeeks }, (_, wIdx) => {
    const weekName = `Semana ${wIdx + 1}`;
    const weekTheme = baseThemes[wIdx % baseThemes.length];
    const dWeeks = daysOfWeek.map((dayName, dIdx) => {
      const drills = [];
      let currentMinutesSum = 0;
      let drillIdxInDay = 0;
      while (currentMinutesSum < totalMinutes) {
        let drillDuration = 12;
        const remainingTime = totalMinutes - currentMinutesSum;
        if (remainingTime < 10) {
          if (drills.length > 0) {
            drills[drills.length - 1].durationMinutes = Math.min(15, drills[drills.length - 1].durationMinutes + remainingTime);
            currentMinutesSum += remainingTime;
            break;
          } else {
            drillDuration = 10;
          }
        } else if (remainingTime <= 15) {
          drillDuration = remainingTime;
        } else {
          drillDuration = drillIdxInDay % 2 === 0 ? 15 : 12;
        }
        const category = categories[(wIdx * 3 + dIdx * 2 + drillIdxInDay) % categories.length];
        const isAlternative = customPrompt && (customPrompt.toLowerCase().includes("alternat") || customPrompt.toLowerCase().includes("diferent"));
        const seedOffset = isAlternative ? 5 : 0;
        const seedValue = (wIdx * 17 + dIdx * 11 + drillIdxInDay * 7 + seedOffset) % 15;
        const catBases = bases[category] || bases.tiro;
        const rawTitle = catBases.titles[seedValue % catBases.titles.length];
        const detail = catBases.details[(seedValue + 3) % catBases.details.length];
        const action = catBases.actions[(seedValue + 7) % catBases.actions.length];
        const evoList = evolutions[category] || evolutions.tiro;
        const evoString = evoList[(seedValue + dIdx) % evoList.length];
        let playerRoleLabel = "de enfoque Todoterreno y Balanceado";
        let biomechanicsAdvice = "Mant\xE9n la concentraci\xF3n t\xE9cnica y la postura correcta.";
        if (role === "shooter") {
          playerRoleLabel = "de estilo Francotirador / Tirador Sniper (Catch & Shoot, salidas de bloqueo)";
          biomechanicsAdvice = "Asegura levantar bien el codo a un \xE1ngulo \xF3ptimo de 90 grados y clavar el follow-through de la mu\xF1eca.";
        } else if (role === "guard") {
          playerRoleLabel = "de estilo Base Armador / Playmaker de \xC9lite (Manejo de bal\xF3n Kyrie Irving, Pick & Roll)";
          biomechanicsAdvice = "Baja dr\xE1sticamente el centro de gravedad buscando estabilidad lateral, usando botes cortos de poder.";
        } else if (role === "big") {
          playerRoleLabel = "de estilo Poste Bajo y Pivote de Selecci\xF3n (Mikan avanzado, ganchos de poste)";
          biomechanicsAdvice = "Trabaja el juego de pies sosteniendo el pivote de fuerza y elevando el bal\xF3n arriba del ment\xF3n.";
        }
        let modePhrase = "Se ejecuta de manera individual simulando un defensor en la posici\xF3n utilizando fintas y auto-pases.";
        if (mode === "duo") {
          modePhrase = "Se realiza de forma colaborativa en parejas, donde tu compa\xF1ero asiste enviando pases r\xE1pidos de pecho o simulando defensa activa para generar contratiempo.";
        }
        let rpePhrase = "esfuerzo suave (RPE 4-5)";
        let intensityGuide = "Ritmo moderado priorizando la elegancia en los movimientos y estiramiento activo.";
        let targetRepsText = "Completar la secuencia 12 veces con calma y con respiraci\xF3n controlada.";
        let ageGoal = "Enfocar el juego feliz en canasta con metas coordinativas ligeras.";
        if (mappedAge === "8-11") {
          ageGoal = "Gamificaci\xF3n infantil alegre. Evitar fatiga extrema o fuerza excesiva sobre hombros.";
          targetRepsText = "Realizar 8 series divertidas, celebrando cada enceste con choque de manos.";
        } else if (mappedAge === "12-14") {
          ageGoal = "Desarrollo de postura biomec\xE1nica, pases limpios y excelente trayectoria en chicos cadetes.";
          targetRepsText = "Anotar 15 aciertos netos cuidando que tus pies apunten paralelos al canasto.";
        } else if (mappedAge === "15-17") {
          ageGoal = "Rutina pre-universitaria competitiva de alto volumen y acondicionamiento intenso de instituto.";
          targetRepsText = "Anotar 25 repeticiones fluidas bajo fatiga, midiendo la velocidad del cron\xF3metro.";
        } else {
          ageGoal = "Nivel Varsity / Pro de alta intensidad para adultos con metas de acierto exigentes.";
          targetRepsText = "Alcanzar 35 encestes reales bajo fatiga f\xEDsica real sosteniendo altos porcentajes (75%+).";
        }
        if (level === "casual") {
          rpePhrase = "esfuerzo suave (RPE 4-5)";
          intensityGuide = "Ritmo recreativo relajado enfocado en pulir detalles t\xE1cticos y estiramiento activo.";
        } else if (level === "elite") {
          rpePhrase = "esfuerzo extremo (RPE 8-10) Prep NCAA";
          intensityGuide = "Ritmo infernal de alta velocidad simulando el cansancio acumulado de la pr\xF3rroga de juego.";
          if (mappedAge === "8-11") {
            rpePhrase = "esfuerzo moderado adaptado (RPE 5-6)";
            intensityGuide = "Ritmo din\xE1mico y continuo con pausas breves frecuentes de agua.";
          }
        } else {
          rpePhrase = "esfuerzo competitivo de club nacional (RPE 6-7)";
          intensityGuide = "Paso regular exigente para adquirir una forma f\xEDsica ideal de cara a la temporada formal.";
        }
        const formattedTitle = `[W${wIdx + 1}-D${dIdx + 1}-D${drillIdxInDay + 1}] ${rawTitle}`;
        const description = `Rutina especializada ${playerRoleLabel}. Consiste en ${action}, ${detail}. ${evoString} ${modePhrase} Gu\xEDa de ritmo general: ${intensityGuide}. Cuidado biomec\xE1nico del Coach: ${biomechanicsAdvice} ${ageGoal}`;
        const assignedObjective = `${category === "tiro" || category === "kobe" ? "Alinear codo a 90\xB0." : "Bajar centro de gravedad."} RPE aconsejado: ${rpePhrase}.`;
        drills.push({
          id: `w${wIdx + 1}-d${dIdx + 1}-dr${drillIdxInDay + 1}-${category}`,
          title: formattedTitle,
          category,
          description,
          durationMinutes: drillDuration,
          intensity: level === "elite" ? "Alta" : level === "casual" ? "Baja" : "Media",
          targetReps: targetRepsText,
          assignedObjective
        });
        currentMinutesSum += drillDuration;
        drillIdxInDay++;
      }
      return {
        dayName,
        theme: `D\xEDa ${dIdx + 1}: ${weekTheme} (Enfoque ${dayName})`,
        drills
      };
    });
    return {
      weekName,
      theme: weekTheme,
      days: dWeeks
    };
  });
  return {
    title: `Pinetys Grind Summer Academy (${ageGroup} a\xF1os) \u2022 Programa de ${numWeeks} Semanas`,
    description: `Rutinas f\xEDsicas y mec\xE1nicas profesionales basadas en programas Prep School USA de primer nivel. Personalizado con estilo ${role === "shooter" ? "Tirador" : role === "guard" ? "Playmaker" : role === "big" ? "Poste Bajo" : "Todoterreno"}, modalidad ${mode === "duo" ? "Parejas" : "Individual"} e intensidad de ritmo ${level === "elite" ? "\xC9lite NCAA" : level === "casual" ? "Casual Recreativo" : "Competitivo Club"}. Adaptado biomec\xE1nicamente para cuidar las articulaciones, calentar adecuadamente y evitar lesiones.`,
    recommendedWeeklyHours: daysOfWeek.length * hours,
    weeks
  };
}
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
