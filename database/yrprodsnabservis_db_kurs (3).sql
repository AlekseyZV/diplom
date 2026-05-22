-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Апр 03 2026 г., 10:27
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `yrprodsnabservis_db_kurs`
--

-- --------------------------------------------------------

--
-- Структура таблицы `kategoriy`
--

CREATE TABLE `kategoriy` (
  `id` int(11) NOT NULL,
  `Name` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `kategoriy`
--

INSERT INTO `kategoriy` (`id`, `Name`) VALUES
(1, 'Ароматизаторы'),
(2, 'Готовые мучные смеси'),
(3, 'Дрожжи'),
(4, 'Ингредиенты для начинок'),
(5, 'Кондитерские украшения'),
(6, 'Кондитерские формы'),
(7, 'Кондитерский инвентарь'),
(8, 'Кондитерское сырье'),
(9, 'Красители'),
(10, 'Маргариновая продукция'),
(11, 'Начинки'),
(12, 'Орехи'),
(13, 'Сухофрукты'),
(14, 'Функциональные добавки'),
(15, 'Гастрономия'),
(16, 'Грибы'),
(17, 'Консервация овощная'),
(18, 'Консервация томатная'),
(19, 'Консервация фруктовая'),
(20, 'Майонезы промтара'),
(21, 'Масло промтара'),
(22, 'Масложировая продукция');

-- --------------------------------------------------------

--
-- Структура таблицы `obrantaysvyz`
--

CREATE TABLE `obrantaysvyz` (
  `id` int(11) NOT NULL,
  `familiy` varchar(200) NOT NULL,
  `imy` varchar(200) NOT NULL,
  `otchestvo` varchar(200) NOT NULL,
  `pochta` varchar(500) NOT NULL,
  `phone` decimal(12,0) DEFAULT NULL,
  `komment` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `obrantaysvyz`
--

INSERT INTO `obrantaysvyz` (`id`, `familiy`, `imy`, `otchestvo`, `pochta`, `phone`, `komment`) VALUES
(1, 'Ветров', 'Алеексей', 'Алексеевич', 'veter@mail.ru', 89654561212, 'Хочу связаться с менеджером компании'),
(2, 'Заведеев', 'Алексей', 'Александрович', 'al@mail.ru', 89994444545, 'фыв'),
(3, 'Заведеев', 'Алексей', 'Александрович', 'al@mail.ru', 89994444545, 'Нужно связаться с менеджером для обсуждение оптовой закупки товара'),
(5, 'admin', 'admin', 'admin', 'admin@mail.ru', 112, 'Что  у вас тут происходит!?'),
(6, 'admin', 'admin', 'admin', 'admin@mail.ru', 0, 'text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text,');

-- --------------------------------------------------------

--
-- Структура таблицы `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `Name` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `role`
--

INSERT INTO `role` (`id`, `Name`) VALUES
(1, 'Администратор'),
(2, 'Сотрудник'),
(3, 'Покупатель'),
(4, 'Гость');

-- --------------------------------------------------------

--
-- Структура таблицы `statususer`
--

CREATE TABLE `statususer` (
  `id` int(11) NOT NULL,
  `Name` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `statususer`
--

INSERT INTO `statususer` (`id`, `Name`) VALUES
(1, 'Физическое лицо'),
(2, 'Юридическое лицо');

-- --------------------------------------------------------

--
-- Структура таблицы `statuszakaza`
--

CREATE TABLE `statuszakaza` (
  `id` int(11) NOT NULL,
  `Name` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `statuszakaza`
--

INSERT INTO `statuszakaza` (`id`, `Name`) VALUES
(1, 'Оформлен'),
(2, 'На проверке'),
(3, 'Подтвержден'),
(4, 'Ожидает оплаты'),
(5, 'Оплачен'),
(6, 'На комплектации'),
(7, 'Готов к отгрузке'),
(8, 'Отгружен'),
(9, 'Доставлен'),
(10, 'Отменен');

-- --------------------------------------------------------

--
-- Структура таблицы `tovar`
--

CREATE TABLE `tovar` (
  `id` int(11) NOT NULL,
  `Name` varchar(200) NOT NULL,
  `opisanie` text DEFAULT NULL,
  `kolichestvo` int(11) DEFAULT NULL,
  `idKategoriy` int(11) NOT NULL,
  `cena` decimal(15,2) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `tovar`
--

INSERT INTO `tovar` (`id`, `Name`, `opisanie`, `kolichestvo`, `idKategoriy`, `cena`, `image`, `isDeleted`) VALUES
(1, 'Вкусоароматические добавки Del’Ar', 'Вкусовая добавка', NULL, 1, 12.20, '\\delar.jpg', 1),
(3, 'Посип', NULL, 9955, 2, 5.25, '\\posip.jpg', 0),
(4, 'Активные сухие дрожжи для пиццы', NULL, 9958, 3, 5.25, '\\pizza.jpg', NULL),
(5, 'Сухой глюкозный сироп Glucidex IT', NULL, 9987, 4, 5.25, '\\suhoy.png', NULL),
(6, 'Айсинг – Мастика сахарная ванильная «КРУЖЕВО»', NULL, 9989, 5, 5.25, '\\r4.png', NULL),
(7, 'Форма-резак кольцо', NULL, 9990, 6, 5.25, '\\rezak.png', NULL),
(8, 'Набор вырубок кондитерских', NULL, 9990, 7, 5.25, '\\rez.jpg', NULL),
(9, 'Агар Denagar 900 GA', NULL, 10000, 8, 5.25, '\\ga.jpg', NULL),
(10, 'Красители Esco', NULL, 10000, 9, 5.25, '\\Esco.jpg', NULL),
(11, 'Заменители молочного жира группы «Oilblend»', NULL, 10000, 10, 5.25, '\\Oilblend.png', NULL),
(12, 'Конфитюр термостабильные', NULL, 10000, 11, 5.25, '\\Конфитюр термостабильные.jpg', NULL),
(13, 'Арахис', NULL, 10000, 12, 5.25, '\\arahis.jpeg', NULL),
(14, 'Изюм', NULL, 9980, 13, 5.25, '\\izuym.jpeg', NULL),
(15, 'Глофа-экстракт', NULL, 10000, 14, 5.25, '\\ru_pim.png', NULL),
(16, 'Бульон “Mareven Food Professional”', NULL, 9980, 15, 5.25, '\\govijiy.jpg', NULL),
(17, 'Намеко (опята) целые отборные SUNFEEL', 'Объем: 3100 мл, Количество в упаковке: 6, Сухой вес: 1,8', 10000, 16, 5.25, '\\opyta.jpg', NULL),
(18, 'Горошек зелёный в пакете', NULL, 10000, 17, 5.25, '\\goroh.jpg', NULL),
(19, 'Кетчуп Печагин “Шашлычный”', NULL, 10000, 18, 5.25, '\\ket.jpg', NULL),
(20, 'Абрикосы половинки в сиропе SUNFEEL', NULL, 10000, 19, 5.25, '\\abrikoc.jpg', NULL),
(21, 'Майонез Pechagin Professional “Extra” 67%', NULL, 10000, 20, 5.25, '\\mazik.jpg', NULL),
(22, 'Каролина подсолнечное рафинированное дезодорированное', NULL, 10000, 21, 5.25, '\\masloKolos.jpg', NULL),
(23, 'Сливочки Славянские', 'Сливочки сгущенные с сахаром «Славянские»', 10000, 22, 5.25, '\\Slivochki-sgushhennye-s-saharom-slavyanskie-380-g_enl.jpg', NULL),
(24, 'Сгущенка вареная', NULL, NULL, 22, 20.00, '\\Varinay_sgushenka.jpg', 1),
(25, 'Молоко Сгущённое ГОСТ', NULL, NULL, 22, 30.00, '\\Milk_sgushinaeGOST.jpg', 1),
(26, 'Ароматизаторы сладкие Del’Ar', '', 10, 1, 30.00, '\\r1.png', 0),
(27, 'Ароматизаторы гастрономические Del’Ar', '', 50, 1, 3.00, '\\delAr3.jpg', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `tovarzakaz`
--

CREATE TABLE `tovarzakaz` (
  `id` int(11) NOT NULL,
  `idTovar` int(11) NOT NULL,
  `kolichestvo` int(11) NOT NULL,
  `idZakaz` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `tovarzakaz`
--

INSERT INTO `tovarzakaz` (`id`, `idTovar`, `kolichestvo`, `idZakaz`) VALUES
(1, 12, 20, 1),
(2, 13, 50, 1),
(3, 23, 1, 1),
(4, 23, 1, 2),
(5, 24, 3, 2),
(6, 25, 1, 2),
(7, 23, 1, 3),
(8, 24, 3, 3),
(9, 25, 1, 3),
(10, 23, 1, 4),
(11, 24, 2, 4),
(12, 25, 4, 4),
(13, 23, 1, 5),
(14, 24, 2, 5),
(15, 25, 4, 5),
(16, 24, 2, 6),
(17, 25, 1, 6),
(18, 24, 2, 7),
(19, 25, 1, 7),
(20, 1, 1, 8),
(21, 3, 1, 8),
(22, 4, 1, 8),
(23, 24, 2, 9),
(24, 25, 2, 9),
(25, 5, 2, 9),
(26, 6, 2, 9),
(27, 1, 1, 10),
(28, 3, 1, 10),
(29, 4, 1, 10),
(30, 5, 1, 10),
(31, 3, 10, 11),
(32, 4, 10, 11),
(33, 5, 10, 11),
(34, 6, 10, 11),
(35, 7, 10, 11),
(36, 8, 10, 11),
(37, 3, 1, 12),
(38, 4, 1, 12),
(39, 5, 1, 12),
(40, 3, 1, 13),
(41, 4, 1, 13),
(42, 5, 1, 13),
(43, 14, 5, 14),
(44, 16, 5, 14),
(45, 14, 5, 15),
(46, 16, 5, 15),
(47, 14, 5, 16),
(48, 16, 5, 16),
(49, 14, 5, 17),
(50, 16, 5, 17),
(51, 3, 1, 18),
(52, 4, 1, 18),
(53, 3, 1, 19),
(54, 4, 1, 19),
(55, 3, 1, 20),
(56, 4, 1, 20),
(57, 3, 1, 21),
(58, 4, 1, 21),
(59, 3, 1, 22),
(60, 4, 1, 22),
(61, 3, 5, 23),
(62, 4, 5, 23),
(63, 3, 5, 24),
(64, 4, 5, 24),
(65, 3, 5, 25),
(66, 4, 5, 25),
(67, 3, 5, 26),
(68, 4, 5, 26),
(69, 3, 5, 27),
(70, 4, 5, 27),
(71, 5, 1, 28),
(72, 6, 1, 28),
(73, 24, 1, 29),
(74, 25, 2, 29),
(75, 25, 5, 30),
(76, 24, 1, 31),
(77, 3, 1, 32),
(78, 25, 1, 33),
(79, 25, 2, 34),
(80, 25, 4, 35),
(81, 25, 2, 36),
(82, 25, 4, 37),
(83, 1, 1, 38),
(84, 3, 1, 38),
(85, 24, 1, 38),
(86, 25, 1, 38),
(87, 25, 4, 39),
(88, 25, 5, 40),
(89, 1, 1, 41),
(90, 25, 2, 42),
(91, 25, 5, 43),
(92, 3, 1, 44),
(93, 25, 3, 44),
(94, 1, 1, 45),
(95, 26, 5, 46);

-- --------------------------------------------------------

--
-- Структура таблицы `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `familiy` varchar(200) NOT NULL,
  `imy` varchar(200) NOT NULL,
  `otchestvo` varchar(200) NOT NULL,
  `dateRojdeniy` date DEFAULT NULL,
  `status` int(11) NOT NULL,
  `phone` decimal(12,0) NOT NULL,
  `role` int(11) NOT NULL,
  `login` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `dataRegistraciy` date NOT NULL,
  `isBlocked` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `user`
--

INSERT INTO `user` (`id`, `familiy`, `imy`, `otchestvo`, `dateRojdeniy`, `status`, `phone`, `role`, `login`, `password`, `dataRegistraciy`, `isBlocked`) VALUES
(1, 'Заведеев', 'Алексей', 'Александрович', '2006-01-04', 1, 81231231122, 3, 'al@mail.ru', '123321', '2025-12-09', 0),
(2, 'Ветров', 'Алексей', 'Алексеевич', '2000-01-01', 1, 79998884422, 3, 'veter@mail.ru', '123123', '2025-12-09', 0),
(3, 'фывфыв', 'фывфыв', 'фывфывф', NULL, 1, 89994444545, 4, 'asd@mail.ru', '123123', '2025-12-12', 0),
(4, 'Заведеев', 'Алексей', 'Александрович', NULL, 1, 89641546868, 4, 'alex@mail.ru', '123123', '2025-12-12', 0),
(5, 'Заведеев', 'Алексей', 'Александрович', NULL, 1, 74564654445, 4, 'al@mail.ru', '123123', '2025-12-12', 0),
(6, 'Пушкин', 'Антон', 'Сергеич', NULL, 1, 84566544545, 4, 'psh@mail.ru', '123123', '2025-12-12', 1),
(7, 'Зeаведеев', 'Алeексей', 'Александрович', NULL, 1, 89994444545, 4, 'qweal@mail.ru', '123123', '2025-12-12', 1),
(8, 'Пушкин', 'Антон', 'Сергеич', NULL, 1, 89994444545, 4, 'psh@mail.ru', '123123', '2025-12-12', 0),
(9, 'Заведеев', 'Алексей', 'Александрович', NULL, 1, 89994444545, 4, 'al@mail.ru', '123123', '2025-12-12', 0),
(10, 'Иванов', 'Иван', 'Иванович', NULL, 1, 81113334455, 4, 'ii@mail.ru', '123123', '2025-12-12', 0),
(11, 'Толик', 'Толик', 'Толик', NULL, 1, 89999996655, 4, '61annual@livinitlarge.net', '123123', '2025-12-12', 0),
(48, 'Заведеев', 'Алексей', 'Александрович', NULL, 1, 89999999999, 4, 'al@mail.ru', '123123', '2025-12-19', 0),
(49, 'qwe', 'qweq', 'qwe', NULL, 1, 84455561122, 4, 'qwesad@mail.ru', '123123', '2025-12-19', 1),
(50, 'admin', 'admin', 'admin', '2000-01-01', 1, 112, 1, 'admin@mail.ru', 'admin', '2026-03-06', 0),
(51, 'Заведеев', 'Алексей', 'Александрович', NULL, 1, 1233211212, 2, 'al123@mail.ru', '123123', '2026-03-06', 0),
(52, 'Волков', 'root', 'root', NULL, 1, 84566541111, 1, 'root@mail.ru', '123123', '2026-03-09', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `zakaz`
--

CREATE TABLE `zakaz` (
  `id` int(11) NOT NULL,
  `idUser` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `oplata` varchar(100) DEFAULT NULL,
  `dateSozdaniy` date NOT NULL,
  `dostavka` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `zakaz`
--

INSERT INTO `zakaz` (`id`, `idUser`, `status`, `oplata`, `dateSozdaniy`, `dostavka`) VALUES
(1, 1, 2, NULL, '2025-12-09', NULL),
(2, 3, 1, 'card', '2025-12-12', 'pickup'),
(3, 3, 1, 'card', '2025-12-12', 'pickup'),
(4, 4, 1, 'card', '2025-12-12', 'pickup'),
(5, 4, 1, 'card', '2025-12-12', 'pickup'),
(6, 5, 1, 'cash', '2025-12-12', 'pickup'),
(7, 5, 1, 'cash', '2025-12-12', 'pickup'),
(8, 5, 1, 'cash', '2025-12-12', 'pickup'),
(9, 6, 1, 'cash', '2025-12-12', 'pickup'),
(10, 6, 1, 'card', '2025-12-12', 'pickup'),
(11, 6, 1, 'card', '2025-12-12', 'pickup'),
(12, 7, 1, 'card', '2025-12-12', 'pickup'),
(13, 7, 1, 'card', '2025-12-12', 'pickup'),
(14, 8, 1, 'cash', '2025-12-12', 'pickup'),
(15, 8, 1, 'cash', '2025-12-12', 'pickup'),
(16, 8, 1, 'cash', '2025-12-12', 'pickup'),
(17, 8, 1, 'cash', '2025-12-12', 'pickup'),
(18, 9, 1, 'card', '2025-12-12', 'pickup'),
(19, 9, 1, 'card', '2025-12-12', 'pickup'),
(20, 9, 1, 'card', '2025-12-12', 'pickup'),
(21, 9, 1, 'card', '2025-12-12', 'pickup'),
(22, 9, 1, 'card', '2025-12-12', 'pickup'),
(23, 9, 1, 'card', '2025-12-12', 'pickup'),
(24, 9, 1, 'card', '2025-12-12', 'pickup'),
(25, 9, 1, 'card', '2025-12-12', 'pickup'),
(26, 9, 1, 'card', '2025-12-12', 'pickup'),
(27, 9, 1, 'card', '2025-12-12', 'pickup'),
(28, 9, 1, 'card', '2025-12-12', 'pickup'),
(29, 9, 1, 'card', '2025-12-12', 'pickup'),
(30, 10, 1, 'card', '2025-12-12', 'pickup'),
(31, 9, 1, 'cash', '2025-12-12', 'pickup'),
(32, 9, 1, 'cash', '2025-12-12', 'pickup'),
(33, 11, 1, 'cash', '2025-12-12', 'pickup'),
(35, 9, 1, 'card', '2025-12-14', 'pickup'),
(36, 9, 1, 'card', '2025-12-15', 'pickup'),
(37, 9, 1, 'card', '2025-12-15', 'pickup'),
(38, 1, 9, 'card', '2025-12-18', 'pickup'),
(39, 2, 1, 'card', '2025-12-18', 'pickup'),
(40, 48, 1, 'cash', '2025-12-19', 'pickup'),
(41, 49, 1, 'cash', '2025-12-19', 'pickup'),
(42, 1, 1, 'card', '2025-12-19', 'pickup'),
(43, 1, 1, 'cash', '2025-12-19', 'pickup'),
(44, 1, 1, 'card', '2025-12-19', 'pickup'),
(45, 48, 1, 'card', '2026-03-09', 'pickup'),
(46, 9, 1, 'card', '2026-03-09', 'pickup');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `kategoriy`
--
ALTER TABLE `kategoriy`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `obrantaysvyz`
--
ALTER TABLE `obrantaysvyz`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `statususer`
--
ALTER TABLE `statususer`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `statuszakaza`
--
ALTER TABLE `statuszakaza`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `tovar`
--
ALTER TABLE `tovar`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idKategoriy` (`idKategoriy`);

--
-- Индексы таблицы `tovarzakaz`
--
ALTER TABLE `tovarzakaz`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idTovar` (`idTovar`),
  ADD KEY `idZakaz` (`idZakaz`);

--
-- Индексы таблицы `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `status` (`status`),
  ADD KEY `role` (`role`);

--
-- Индексы таблицы `zakaz`
--
ALTER TABLE `zakaz`
  ADD PRIMARY KEY (`id`),
  ADD KEY `status` (`status`),
  ADD KEY `idUser` (`idUser`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `kategoriy`
--
ALTER TABLE `kategoriy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT для таблицы `obrantaysvyz`
--
ALTER TABLE `obrantaysvyz`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблицы `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `statususer`
--
ALTER TABLE `statususer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `statuszakaza`
--
ALTER TABLE `statuszakaza`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT для таблицы `tovar`
--
ALTER TABLE `tovar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT для таблицы `tovarzakaz`
--
ALTER TABLE `tovarzakaz`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT для таблицы `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT для таблицы `zakaz`
--
ALTER TABLE `zakaz`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `tovar`
--
ALTER TABLE `tovar`
  ADD CONSTRAINT `tovar_ibfk_1` FOREIGN KEY (`idKategoriy`) REFERENCES `kategoriy` (`id`);

--
-- Ограничения внешнего ключа таблицы `tovarzakaz`
--
ALTER TABLE `tovarzakaz`
  ADD CONSTRAINT `tovarzakaz_ibfk_1` FOREIGN KEY (`idTovar`) REFERENCES `tovar` (`id`);

--
-- Ограничения внешнего ключа таблицы `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`status`) REFERENCES `statususer` (`id`),
  ADD CONSTRAINT `user_ibfk_2` FOREIGN KEY (`role`) REFERENCES `role` (`id`);

--
-- Ограничения внешнего ключа таблицы `zakaz`
--
ALTER TABLE `zakaz`
  ADD CONSTRAINT `zakaz_ibfk_2` FOREIGN KEY (`status`) REFERENCES `statuszakaza` (`id`),
  ADD CONSTRAINT `zakaz_ibfk_3` FOREIGN KEY (`idUser`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
