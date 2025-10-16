-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 16, 2025 at 09:48 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `abc`
--

-- --------------------------------------------------------

--
-- Table structure for table `guest`
--

CREATE TABLE `guest` (
  `id` int(11) NOT NULL,
  `home_id` int(11) DEFAULT NULL,
  `rank_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `lname` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `pos` varchar(255) DEFAULT NULL,
  `income` int(11) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `job_phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_right_holder` tinyint(1) DEFAULT 0,
  `title` varchar(20) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guest_history`
--

CREATE TABLE `guest_history` (
  `id` int(11) NOT NULL,
  `guest_id` int(11) DEFAULT NULL,
  `rank_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `lname` varchar(255) DEFAULT NULL,
  `home_id` int(11) DEFAULT NULL,
  `home_address` varchar(255) DEFAULT NULL,
  `move_status_id` int(11) DEFAULT NULL,
  `moved_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guest_history`
--

INSERT INTO `guest_history` (`id`, `guest_id`, `rank_id`, `name`, `lname`, `home_id`, `home_address`, `move_status_id`, `moved_at`) VALUES
(1, NULL, NULL, 'สุพรรณี', 'วงค์งาม', NULL, '1', 45, '2025-10-12 19:15:27'),
(2, NULL, NULL, 'สุพรรณี', 'วงค์งาม', NULL, '1', 1, '2025-10-13 07:06:53'),
(3, NULL, NULL, 'ภูวดล', 'พานทอง', NULL, '2', 2, '2025-10-13 07:10:26'),
(4, NULL, NULL, 'ภูวดล', 'พานทอง', NULL, '1', 1, '2025-10-14 02:15:47'),
(6, NULL, 454, 'ภูวดล', 'พานทอง', NULL, '2', 2, '2025-10-14 08:01:30'),
(7, NULL, 454, 'ภูวดล', 'พานทอง', NULL, '1', 1, '2025-10-16 02:23:14');

-- --------------------------------------------------------

--
-- Table structure for table `guest_logs`
--

CREATE TABLE `guest_logs` (
  `id` int(11) NOT NULL,
  `guest_id` int(11) DEFAULT NULL,
  `home_id` int(11) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `detail` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `rank_name` varchar(50) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `lname` varchar(255) DEFAULT NULL,
  `home_address` varchar(255) DEFAULT NULL,
  `home_type_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guest_logs`
--

INSERT INTO `guest_logs` (`id`, `guest_id`, `home_id`, `action`, `detail`, `created_at`, `rank_name`, `name`, `lname`, `home_address`, `home_type_name`) VALUES
(10, NULL, NULL, 'add', 'เพิ่มผู้พักอาศัย: ยศทหาร ภูวดล พานทอง (ผู้ถือสิทธิ) เข้าพักบ้านเลขที่ 1', '2025-10-14 02:48:37', NULL, NULL, NULL, NULL, NULL),
(11, NULL, NULL, 'add', 'เพิ่มผู้พักอาศัย: เด็กชาย สน พานทอง (สมาชิกครอบครัว) เข้าพักบ้านเลขที่ 1', '2025-10-14 02:49:03', NULL, NULL, NULL, NULL, NULL),
(12, NULL, NULL, 'edit', 'แก้ไขข้อมูลผู้พักอาศัย สน พานทอง (บ้านเลขที่ 1): ยศ: null → นาย', '2025-10-14 02:49:23', NULL, NULL, NULL, NULL, NULL),
(13, NULL, NULL, 'add', 'เพิ่มผู้พักอาศัย: ยศทหาร ภูวดล พานทอง (ผู้ถือสิทธิ) เข้าพักบ้านเลขที่ 1', '2025-10-14 03:01:20', NULL, NULL, NULL, NULL, NULL),
(14, NULL, NULL, 'add', 'เพิ่มผู้พักอาศัย: เด็กชาย สน พานทอง (สมาชิกครอบครัว) เข้าพักบ้านเลขที่ 1', '2025-10-14 03:01:38', NULL, NULL, NULL, NULL, NULL),
(29, NULL, NULL, 'delete', 'ลบผู้พักอาศัย: นาย ภูวดล พานทอง จากบ้านเลขที่ 1 (บ้านเดี่ยว)', '2025-10-16 02:07:00', 'นาย', 'ภูวดล', 'พานทอง', '1', 'บ้านเดี่ยว'),
(34, NULL, NULL, 'delete', 'ลบผู้พักอาศัย: พันจ่าโท พพ พพ จากบ้านเลขที่ 1 (คอนโด)', '2025-10-16 02:07:35', 'พันจ่าโท', 'พพ', 'พพ', '1', 'คอนโด'),
(54, NULL, NULL, 'delete', 'ลบผู้พักอาศัย: นาย ภูวดล พานทอง จากบ้านเลขที่ 101 (คอนโด)', '2025-10-16 07:35:25', 'นาย', 'ภูวดล', 'พานทอง', '101', 'คอนโด'),
(55, NULL, NULL, 'delete', 'ลบผู้พักอาศัย: เด็กชาย ภูวดล พานทอง จากบ้านเลขที่ 101 (คอนโด)', '2025-10-16 07:35:25', 'เด็กชาย', 'ภูวดล', 'พานทอง', '101', 'คอนโด'),
(56, NULL, NULL, 'add', 'เพิ่มผู้พักอาศัย: ยศทหาร ภูวดล พานทอง (ผู้ถือสิทธิ) เข้าพักบ้านเลขที่ 101', '2025-10-16 07:35:58', NULL, NULL, NULL, NULL, NULL),
(57, NULL, NULL, 'add', 'เพิ่มผู้พักอาศัย: เด็กชาย สน พานทอง (สมาชิกครอบครัว) เข้าพักบ้านเลขที่ 101', '2025-10-16 07:35:58', NULL, NULL, NULL, NULL, NULL),
(58, NULL, NULL, 'delete', 'ลบผู้พักอาศัย: นาวาเอก somchai mantis จากบ้านเลขที่ 1 (บ้านเดี่ยว)', '2025-10-16 07:36:56', 'นาวาเอก', 'somchai', 'mantis', '1', 'บ้านเดี่ยว');

-- --------------------------------------------------------

--
-- Table structure for table `guest_scores`
--

CREATE TABLE `guest_scores` (
  `id` int(11) NOT NULL,
  `rank_id` int(11) DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `lname` varchar(255) DEFAULT NULL,
  `phone` int(10) DEFAULT NULL,
  `total_score` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guest_scores`
--

INSERT INTO `guest_scores` (`id`, `rank_id`, `title`, `name`, `lname`, `phone`, `total_score`, `details`, `created_at`) VALUES
(3, 1, '', 'ก', 'ำไ', 0, 20, 'ไไไ', '2025-10-12 08:31:56'),
(8, 3, '', 'd', 'd', 0, 13, 'd', '2025-10-14 02:06:19'),
(9, 13, 'นาย', 'สุรบด', 'หลี', 0, 14, 'เข้าหน่อย\n', '2025-10-14 02:08:15'),
(12, 478, 'นาย', 'ภูวดล', 'พานทอง', 0, 1, '2025-04-23', '2025-10-14 04:27:42'),
(14, 456, '', 'ภูวดล', 'พานทอง', 0, 19, '2025-01-20', '2025-10-14 08:03:04'),
(16, 470, '', 'ภูวดล', 'พานทอง', 928129552, 13, '2025-02-23', '2025-10-16 07:39:46');

-- --------------------------------------------------------

--
-- Table structure for table `home`
--

CREATE TABLE `home` (
  `home_id` int(11) NOT NULL,
  `home_type_id` int(11) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `status_id` int(11) DEFAULT NULL,
  `subunit_id` int(11) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `home_unit_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `home`
--

INSERT INTO `home` (`home_id`, `home_type_id`, `Address`, `status_id`, `subunit_id`, `image`, `created_at`, `home_unit_id`) VALUES
(45, 3, '504/29', 2, NULL, NULL, '2025-10-16 04:36:14', 17),
(46, 3, '504/30', 2, NULL, NULL, '2025-10-16 04:36:14', 17),
(47, 3, '504/31', 2, NULL, NULL, '2025-10-16 04:36:15', 17),
(48, 3, '504/32', 2, NULL, NULL, '2025-10-16 04:36:15', 17),
(49, 3, '504/33', 2, NULL, NULL, '2025-10-16 04:36:15', 17),
(50, 3, '504/34', 2, NULL, NULL, '2025-10-16 04:36:15', 17);

-- --------------------------------------------------------

--
-- Table structure for table `home_eligibility`
--

CREATE TABLE `home_eligibility` (
  `id` int(11) NOT NULL,
  `home_type_id` int(11) DEFAULT NULL,
  `rank_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `home_types`
--

CREATE TABLE `home_types` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `max_capacity` int(11) DEFAULT NULL,
  `subunit_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `home_types`
--

INSERT INTO `home_types` (`id`, `name`, `description`, `max_capacity`, `subunit_type`, `created_at`) VALUES
(1, 'บ้านพักแฝด', 'บ้านพักแฝด', 2, 'พื้นที่', '2025-10-03 07:49:02'),
(2, 'บ้านพักเรือนแถว', 'บ้านพักเรือนแถว', 14, 'แถว', '2025-10-03 07:49:02'),
(3, 'แฟลตสัญญาบัตร', 'แฟลตสัญญาบัตร', 4, 'ชั้น', '2025-10-03 07:49:02'),
(4, 'บ้านพักลูกจ้าง', 'บ้านพักลูกจ้าง', 2, 'อาคาร', '2025-10-03 07:49:02');

-- --------------------------------------------------------

--
-- Table structure for table `home_units`
--

CREATE TABLE `home_units` (
  `id` int(11) NOT NULL,
  `home_type_id` int(11) DEFAULT NULL,
  `unit_number` int(11) DEFAULT NULL,
  `unit_name` varchar(255) DEFAULT NULL,
  `subunit_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `home_units`
--

INSERT INTO `home_units` (`id`, `home_type_id`, `unit_number`, `unit_name`, `subunit_id`) VALUES
(1, 1, 1, 'พื้นที่ 1', NULL),
(2, 1, 2, 'พื้นที่ 2', NULL),
(3, 2, 1, 'แถว 1', NULL),
(4, 2, 2, 'แถว 2', NULL),
(5, 2, 3, 'แถว 3', NULL),
(6, 2, 4, 'แถว 4', NULL),
(7, 2, 5, 'แถว 5', NULL),
(8, 2, 6, 'แถว 6', NULL),
(9, 2, 7, 'แถว 7', NULL),
(10, 2, 8, 'แถว 8', NULL),
(11, 2, 9, 'แถว 9', NULL),
(12, 2, 10, 'แถว 10', NULL),
(13, 2, 11, 'แถว 11', NULL),
(14, 2, 12, 'แถว 12', NULL),
(15, 2, 13, 'แถว 13', NULL),
(16, 2, 14, 'แถว 14', NULL),
(17, 3, 1, 'ชั้น 1', NULL),
(18, 3, 2, 'ชั้น 2', NULL),
(19, 3, 3, 'ชั้น 3', NULL),
(20, 3, 4, 'ชั้น 4', NULL),
(21, 4, 1, 'อาคาร 1', NULL),
(22, 4, 2, 'อาคาร 2', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `move_status`
--

CREATE TABLE `move_status` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `move_status`
--

INSERT INTO `move_status` (`id`, `name`) VALUES
(2, 'คืนบ้าน'),
(1, 'เกษียณ'),
(45, 'โดนไล่ออก');

-- --------------------------------------------------------

--
-- Table structure for table `ranks`
--

CREATE TABLE `ranks` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ranks`
--

INSERT INTO `ranks` (`id`, `name`) VALUES
(476, 'จ่าตรี'),
(477, 'จ่าตรีหญิง'),
(472, 'จ่าเอก'),
(473, 'จ่าเอกหญิง'),
(474, 'จ่าโท'),
(475, 'จ่าโทหญิง'),
(479, 'นาง'),
(480, 'นางสาว'),
(478, 'นาย'),
(458, 'นาวาตรี'),
(459, 'นาวาตรีหญิง'),
(454, 'นาวาเอก'),
(455, 'นาวาเอกหญิง'),
(456, 'นาวาโท'),
(457, 'นาวาโทหญิง'),
(470, 'พันจ่าตรี'),
(471, 'พันจ่าตรีหญิง'),
(466, 'พันจ่าเอก'),
(467, 'พันจ่าเอกหญิง'),
(468, 'พันจ่าโท'),
(469, 'พันจ่าโทหญิง'),
(464, 'เรือตรี'),
(465, 'เรือตรีหญิง'),
(460, 'เรือเอก'),
(461, 'เรือเอกหญิง'),
(462, 'เรือโท'),
(463, 'เรือโทหญิง');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'admin'),
(2, 'user');

-- --------------------------------------------------------

--
-- Table structure for table `score_criteria`
--

CREATE TABLE `score_criteria` (
  `id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `ordering` int(11) DEFAULT 0,
  `formula_json` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `score_criteria`
--

INSERT INTO `score_criteria` (`id`, `label`, `ordering`, `formula_json`) VALUES
(1, 'ลักษณะการพักอาศัย', 1, NULL),
(2, 'เป็นผู้มีสิทธิ์เบิกค่าเช่าบ้าน', 2, NULL),
(3, 'ผู้ขอมีรายได้ทั้งหมด (เงินเดือน)', 3, NULL),
(4, 'สถานภาพผู้ขอและคู่สมรส', 4, NULL),
(5, 'จำนวนบุตรทั้งหมด', 5, NULL),
(6, 'จำนวนบุตรที่อยู่ระหว่างศึกษา', 6, NULL),
(7, 'จำนวนบุตรคูณกับระดับการศึกษา', 7, NULL),
(8, 'การเจ็บป่วยที่ส่งผลต่อการดำเนินชีวิตอย่างชัดเจน', 8, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `score_options`
--

CREATE TABLE `score_options` (
  `id` int(11) NOT NULL,
  `criteria_id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `score` int(11) NOT NULL,
  `ordering` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `score_options`
--

INSERT INTO `score_options` (`id`, `criteria_id`, `label`, `score`, `ordering`) VALUES
(1521, 1, 'บ้านบิดามารดา', 2, 1),
(1522, 1, 'เช่าบ้าน', 5, 2),
(1523, 2, 'มีสิทธิ์', 3, 1),
(1524, 3, 'มากกว่า 50,000 บาท', 1, 1),
(1525, 3, '30,000 - 50,000 บาท', 2, 2),
(1526, 3, '15,000 - 30,000 บาท', 3, 3),
(1527, 3, 'ต่ำกว่า 15,000 บาท', 5, 4),
(1528, 4, 'โสด สมรถแยกพื้นที่ขอ/แยกกันอยู่', 1, 1),
(1529, 4, 'โสด อุปการะบิดา - มารดา', 2, 2),
(1530, 4, 'สมรสอยู่ด้วยกัน', 3, 3),
(1531, 4, 'สมรสอยู่ด้วยกัน อุปการะบิดา - มารดา', 5, 4),
(1532, 5, 'ไม่มีบุตร', 1, 1),
(1533, 5, '1 คน', 2, 2),
(1534, 5, '2 คน', 3, 3),
(1535, 5, 'มากกว่า 2 คน', 5, 4),
(1536, 6, 'อนุบาล', 1, 1),
(1537, 6, 'ประถม', 2, 2),
(1538, 6, 'มัธยม', 3, 3),
(1539, 6, 'อุดมศึกษา', 5, 4),
(1540, 8, 'เจ้าของสิทธิ', 2, 1),
(1541, 8, 'บิดา - มารดา', 5, 2);

-- --------------------------------------------------------

--
-- Table structure for table `status`
--

CREATE TABLE `status` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `status`
--

INSERT INTO `status` (`id`, `name`) VALUES
(3, 'ปิดปรับปรุง'),
(1, 'มีผู้พักอาศัย'),
(2, 'ไม่มีผู้พักอาศัย');

-- --------------------------------------------------------

--
-- Table structure for table `subunit_home`
--

CREATE TABLE `subunit_home` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subunit_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subunit_home`
--

INSERT INTO `subunit_home` (`id`, `name`, `subunit_type`) VALUES
(1, 'พื้นที่', 'พื้นที่'),
(2, 'แถว', 'แถว'),
(3, 'ชั้น', 'ชั้น'),
(4, 'อาคาร', 'อาคาร'),
(87, 'ตึก', 'ตึก');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role_id`, `created_at`) VALUES
(1, 'admin', '$2b$10$nz2O..9XDHHCUot5a.RUNO7DFN/tx9K1/tDmj5NSqsDu7yYMFUnje', 1, '2025-10-03 07:49:03'),
(2, 'Poom', '$2b$10$rrI9nlQzQBGYtmgI5q4Vce6cseuZHEDPozcNRGj1dCHQquXgPlYq2', 2, '2025-10-12 19:23:23'),
(5, 'ooo', '$2b$10$iZJ3G09atl1cafmm1ex4G.H/W0NC72IqQSY8ZZfnviBUOpqzqS4WC', 2, '2025-10-16 07:43:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `guest`
--
ALTER TABLE `guest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `home_id` (`home_id`),
  ADD KEY `rank_id` (`rank_id`);

--
-- Indexes for table `guest_history`
--
ALTER TABLE `guest_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `rank_id` (`rank_id`),
  ADD KEY `home_id` (`home_id`),
  ADD KEY `move_status_id` (`move_status_id`);

--
-- Indexes for table `guest_logs`
--
ALTER TABLE `guest_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `home_id` (`home_id`);

--
-- Indexes for table `guest_scores`
--
ALTER TABLE `guest_scores`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `home`
--
ALTER TABLE `home`
  ADD PRIMARY KEY (`home_id`),
  ADD KEY `home_type_id` (`home_type_id`),
  ADD KEY `status_id` (`status_id`),
  ADD KEY `subunit_id` (`subunit_id`);

--
-- Indexes for table `home_eligibility`
--
ALTER TABLE `home_eligibility`
  ADD PRIMARY KEY (`id`),
  ADD KEY `home_type_id` (`home_type_id`),
  ADD KEY `rank_id` (`rank_id`);

--
-- Indexes for table `home_types`
--
ALTER TABLE `home_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `home_units`
--
ALTER TABLE `home_units`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_unit` (`home_type_id`,`unit_number`);

--
-- Indexes for table `move_status`
--
ALTER TABLE `move_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `ranks`
--
ALTER TABLE `ranks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `score_criteria`
--
ALTER TABLE `score_criteria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `label` (`label`);

--
-- Indexes for table `score_options`
--
ALTER TABLE `score_options`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `criteria_id` (`criteria_id`,`label`);

--
-- Indexes for table `status`
--
ALTER TABLE `status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `subunit_home`
--
ALTER TABLE `subunit_home`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `guest`
--
ALTER TABLE `guest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `guest_history`
--
ALTER TABLE `guest_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `guest_logs`
--
ALTER TABLE `guest_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `guest_scores`
--
ALTER TABLE `guest_scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `home`
--
ALTER TABLE `home`
  MODIFY `home_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `home_eligibility`
--
ALTER TABLE `home_eligibility`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `home_types`
--
ALTER TABLE `home_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=650;

--
-- AUTO_INCREMENT for table `home_units`
--
ALTER TABLE `home_units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `move_status`
--
ALTER TABLE `move_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

--
-- AUTO_INCREMENT for table `ranks`
--
ALTER TABLE `ranks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1698;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `score_criteria`
--
ALTER TABLE `score_criteria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=493;

--
-- AUTO_INCREMENT for table `score_options`
--
ALTER TABLE `score_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1690;

--
-- AUTO_INCREMENT for table `status`
--
ALTER TABLE `status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=234;

--
-- AUTO_INCREMENT for table `subunit_home`
--
ALTER TABLE `subunit_home`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=313;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `guest`
--
ALTER TABLE `guest`
  ADD CONSTRAINT `guest_ibfk_1` FOREIGN KEY (`home_id`) REFERENCES `home` (`home_id`),
  ADD CONSTRAINT `guest_ibfk_2` FOREIGN KEY (`rank_id`) REFERENCES `ranks` (`id`);

--
-- Constraints for table `guest_history`
--
ALTER TABLE `guest_history`
  ADD CONSTRAINT `guest_history_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `guest` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `guest_history_ibfk_2` FOREIGN KEY (`rank_id`) REFERENCES `ranks` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `guest_history_ibfk_3` FOREIGN KEY (`home_id`) REFERENCES `home` (`home_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `guest_history_ibfk_4` FOREIGN KEY (`move_status_id`) REFERENCES `move_status` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `guest_logs`
--
ALTER TABLE `guest_logs`
  ADD CONSTRAINT `guest_logs_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `guest` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `guest_logs_ibfk_2` FOREIGN KEY (`home_id`) REFERENCES `home` (`home_id`) ON DELETE SET NULL;

--
-- Constraints for table `home`
--
ALTER TABLE `home`
  ADD CONSTRAINT `home_ibfk_1` FOREIGN KEY (`home_type_id`) REFERENCES `home_types` (`id`),
  ADD CONSTRAINT `home_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `status` (`id`),
  ADD CONSTRAINT `home_ibfk_3` FOREIGN KEY (`subunit_id`) REFERENCES `subunit_home` (`id`);

--
-- Constraints for table `home_eligibility`
--
ALTER TABLE `home_eligibility`
  ADD CONSTRAINT `home_eligibility_ibfk_1` FOREIGN KEY (`home_type_id`) REFERENCES `home_types` (`id`),
  ADD CONSTRAINT `home_eligibility_ibfk_2` FOREIGN KEY (`rank_id`) REFERENCES `ranks` (`id`);

--
-- Constraints for table `home_units`
--
ALTER TABLE `home_units`
  ADD CONSTRAINT `home_units_ibfk_1` FOREIGN KEY (`home_type_id`) REFERENCES `home_types` (`id`);

--
-- Constraints for table `score_options`
--
ALTER TABLE `score_options`
  ADD CONSTRAINT `score_options_ibfk_1` FOREIGN KEY (`criteria_id`) REFERENCES `score_criteria` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
