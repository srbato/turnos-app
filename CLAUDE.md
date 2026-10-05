@AGENTS.md

# Límite académico: solo lo visto en clase

Este proyecto es un trabajo final de la UCA (Programación de Aplicaciones Móviles) y se defiende
oralmente en los sprints. Hay que poder explicar CADA línea. Si algo no se vio en clase, no va,
aunque sea la solución técnicamente mejor. Se prefiere código más largo y explicable a código
corto que no se pueda defender.

## Temas vistos: se pueden usar
- Componentes core: View, Text, Image, TextInput, Pressable, Touchables, Button, Switch,
  ScrollView, FlatList, Modal
- StyleSheet, Flexbox, dimensiones, margin/padding, border, shadow, transform, z-index,
  alignSelf, justifyContent, flexDirection, wrap
- Imágenes: require() para locales, { uri } para remotas, los cinco resizeMode
- Navegación: stack navigator y tabs, ruteo
- Estado: useState, useEffect
- Animaciones: API Animated, useNativeDriver
- REST: fetch, métodos HTTP, consumo de una API Express + Prisma + SQLite
- Context: createContext, Provider, useContext, hook propio con throw, useMemo en el value
- AsyncStorage

## NO vistos: no usar sin avisar antes
- useReducer (para el estado de un wizard alcanza useState)
- Custom hooks más allá del useMiContext() que enseñó la cátedra
- Redux, Zustand o cualquier state manager
- Librerías de UI, de iconos, de formularios, de validación, de fechas (date-fns, dayjs, moment)
  o de data fetching (React Query, SWR)
- react-native-reanimated más allá de lo que trae el template

Si parece que hace falta algo de la segunda lista: no usarlo. Avisar, explicar por qué y proponer
la alternativa con lo de la primera lista.

Esta lista crece a medida que avanza la cursada: cuando se da un tema nuevo, Valentín pasa el
material. Si algo no está en la lista de vistos, asumir que todavía no se dio.
