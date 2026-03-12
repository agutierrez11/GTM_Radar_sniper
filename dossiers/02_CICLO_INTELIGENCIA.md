## 1. El Certificado de Origen (Atribución Ética) 🏛️📜
Para que tu mapa tenga credibilidad militar, cada dato tiene ahora una **"Partida de Nacimiento"**:
- **Trazabilidad Total:** Cada vez que el Sniper captura una empresa, guarda automáticamente de dónde vino (ej: `Fuente: FinteChile`).
- **Valor en la Battle Card:** En tus presentaciones ejecutivas, ya no dirás "yo creo que esto es así", dirás: *"Según el directorio oficial de ABFintechs Brasil, esta empresa opera estos rieles"*.
- **Respeto a la Industria:** Al citar a las asociaciones, demuestras que tu búnker es una herramienta de colaboración y no solo de extracción selectiva.

## 2. El Candado de Duplicados (Deduplicación)
...
... (lógica de upsert activa) ...

## 2. El Filtro de Ruido (Sanity Check) 🥪🚫
... (lógica de tortas activa) ...

## 3. Inteligencia de Redes (LinkedIn & Noticias) 📰🔗
Si mandas un link de una noticia o un post de LinkedIn:
- **No guardamos el link de la noticia como la "empresa":** Eso sería un error de principiante.
- **Extracción de Protagonista:** La IA lee la noticia y pregunta: *"¿De quién habla este artículo?"*. Si la noticia dice "Uala levanta capital", la IA identifica a **Uala** como el objetivo.
- **Vínculo de Inteligencia:** 
    1. Busca a la empresa en tu base de datos.
    2. Si no existe, la crea.
    3. Agrega la URL de la noticia en la sección de `recursos` o `novedades` de esa empresa.
- **Resultado:** Tu mapa no se llena de links de noticias, sino de **Empresas Reales** enriquecidas con la información de esas noticias.

## 4. Agregadores y Hubs (Fuentes Masivas) 🏰🛡️
Si mandas un portal como **StartupsLatam.com**:
- **Escaneo de Listados:** El Sniper reconoce que es un agregador. En lugar de buscar "una" empresa, busca **patrones de nombres**.
- **Cacería en Lote (Batch Hunt):** Si en la portada aparecen 10 logos de fintechs nuevas, la IA las "captura" todas.
- **Detección de Sector:** Filtra solo las que son Fintech para no meter una app de delivery o un e-commerce al mapa azul.
- **Resultado:** Con un solo link que mandes un domingo por la tarde, podrías estar actualizando **20 o 30 nodos** de tu mapa de LinkedIn de golpe.

## 5. El Procesamiento "Wow" (Reverse Engineering)
... (los 5 ejes estratégicos) ...
Una vez que el link entra a Supabase, ocurre la magia en la VM (Engine v6):
1.  **Trigger:** El motor ve una fila en `PENDING`.
2.  **Scraping:** Entra al sitio web y lee EL TODO (productos, términos legales, quiénes son).
3.  **Categorización IA (Los 5 Ejes):**
    -   **País:** Mira el footer/direcciones para pintar el Mapa de Latam.
    -   **Vertical:** Clasifica si es Regtech, Wealth, Lending, etc.
    -   **Producto:** Identifica el "Riel" (Visa, Mastercard, SPEI, Pix).
    -   **Regulaciones:** Detecta si mencionan la CNBV, Superintendencia, etc.
    -   **Relaciones:** Si mencionan un partner (ej: "Powered by Pomelo"), crea la línea en el grafo de Obsidian.

## 3. Resultado Final
En segundos, ese link que mandaste por Slack se convierte en un **Nodo Vivo** que:
- Se ilumina en el mapa de calor.
- Aparece conectado a sus competidores en el grafo.
- Te manda un reporte final a Telegram: *"Toño, BELO indexada. Opera Pix en Brasil, usa rieles Visa y está regulada por BCB."*

---
> [!IMPORTANT]
> **Toño:** Tú solo mandas el link. La IA hace el trabajo de detective y el Dashboard se encarga de que se vea increíble en tu próxima presentación.

**¿Ves cómo el búnker se vuelve más "sabio" con cada link que le mandas?** 🛡️🚀🦾💎🏁🎯🌎🤖
