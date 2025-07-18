# Bronevik Admin Panel

Административная панель для управления API Bronevik, переписанная с React на Vue 3 с использованием Pinia и Pug.

## 🚀 Технологии

- **Vue 3** - современный фреймворк для создания пользовательских интерфейсов
- **Pinia** - управление состоянием приложения
- **Pug** - шаблонизатор для более чистого и читаемого кода
- **Tailwind CSS** - утилитарный CSS фреймворк для стилизации
- **Vite** - быстрый сборщик для разработки

## 📁 Структура проекта

```
src/
├── assets/          # Статические ресурсы (стили, изображения)
├── components/      # Vue компоненты
│   ├── auth/        # Компоненты аутентификации
│   ├── dashboard/   # Компоненты админ-панели
│   │   └── tools/   # Инструменты управления
│   └── ui/          # UI компоненты
├── stores/          # Pinia сторы для управления состоянием
├── utils/           # Утилиты и вспомогательные функции
└── views/           # View компоненты (страницы)
```

## 🛠️ Основные возможности

### 📊 Dashboard
- **Constants** - управление системными константами
- **Tools** - инструменты для работы с данными
- **Settings** - настройки системы

### 🔧 Инструменты
- **User Tool** - управление пользователями
  - Поиск пользователей по телефону, email, ID
  - Редактирование полей пользователя
  - Установка реферальных кодов
- **Drive Tool** - управление транспортом (в разработке)
- **Trip Tool** - управление поездками (в разработке)

### ⚙️ Конфигурация
- Переключение между средами (Production, Staging, Development, Local)
- Управление API эндпоинтами
- Мониторинг статуса сервисов

## 🚀 Установка и запуск

1. **Клонирование репозитория**
   ```bash
   git clone <repository-url>
   cd gfp_bronevik_interlayer
   ```

2. **Установка зависимостей**
   ```bash
npm install
```

3. **Запуск в режиме разработки**
   ```bash
npm run dev
```

4. **Сборка для продакшена**
   ```bash
npm run build
```

## 📦 Зависимости

### Основные
- `vue` - Vue.js фреймворк
- `pinia` - управление состоянием
- `@vueuse/core` - утилиты Vue

### Разработка
- `@vitejs/plugin-vue` - плагин Vue для Vite
- `tailwindcss` - CSS фреймворк
- `postcss` - обработка CSS
- `autoprefixer` - автопрефиксы CSS

## 🏗️ Архитектура

### Stores (Pinia)
- `config.js` - управление конфигурациями API
- `constants.js` - управление системными константами
- `users.js` - управление пользователями
- `vehicles.js` - управление транспортом
- `trips.js` - управление поездками

### Utils
- `api.js` - утилиты для работы с API
- `constants.js` - системные константы

## 🎨 Стилизация

Проект использует Tailwind CSS для стилизации с кастомными компонентами:
- `.btn` - базовые кнопки
- `.card` - карточки
- `.form-input` - поля ввода
- `.badge` - бейджи

## 🔄 Миграция с React

Проект был переписан с React на Vue 3, сохранив всю функциональность:

| React | Vue |
|-------|-----|
| `useState` | `ref()` |
| `useEffect` | `watch()` / `watchEffect()` |
| Redux/Zustand | Pinia |
| JSX | Pug templates |
| Styled Components | Tailwind CSS |

## 📝 TODO

- [ ] Реализовать Drive Tool
- [ ] Реализовать Trip Tool
- [ ] Добавить аутентификацию
- [ ] Добавить уведомления
- [ ] Улучшить мобильную версию
- [ ] Добавить тесты

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License
