-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 14, 2025 at 08:40 AM
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

--
-- Dumping data for table `guest`
--

INSERT INTO `guest` (`id`, `home_id`, `rank_id`, `name`, `lname`, `dob`, `pos`, `income`, `phone`, `job_phone`, `created_at`, `is_right_holder`, `title`, `image_url`) VALUES
(13, 1, 454, 'พพ', 'พพ', '1965-06-19', 'ำ', 2, '0899391075', '2', '2025-10-14 04:37:20', 1, NULL, NULL);

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
(1, NULL, NULL, 'สุพรรณี', 'วงค์งาม', 1, '1', 45, '2025-10-12 19:15:27'),
(2, NULL, NULL, 'สุพรรณี', 'วงค์งาม', 1, '1', 1, '2025-10-13 07:06:53'),
(3, NULL, NULL, 'ภูวดล', 'พานทอง', 2, '2', 2, '2025-10-13 07:10:26'),
(4, NULL, NULL, 'ภูวดล', 'พานทอง', 1, '1', 1, '2025-10-14 02:15:47'),
(5, NULL, NULL, 'ภูวดล', 'พานทอง', 14, '1', 45, '2025-10-14 03:01:01');

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
(1, NULL, 1, 'add', 'เพิ่มผู้พักอาศัย: ยศทหาร สุพรรณี วงค์งาม (ผู้ถือสิทธิ) เข้าพักบ้านเลขที่ 1', '2025-10-12 19:13:27', NULL, NULL, NULL, NULL, NULL),
(3, NULL, 1, 'delete', 'ลบผู้พักอาศัย: fff fgff dd จากบ้านเลขที่ 1 (บ้านพักแฝด)', '2025-10-13 06:50:50', 'fff', 'fgff', 'dd', '1', 'บ้านพักแฝด'),
(4, NULL, 1, 'add', 'เพิ่มผู้พักอาศัย: ยศทหาร สุพรรณี วงค์งาม (ผู้ถือสิทธิ) เข้าพักบ้านเลขที่ 1', '2025-10-13 06:51:23', NULL, NULL, NULL, NULL, NULL),
(5, NULL, 1, 'add', 'เพิ่มผู้พักอาศัย: พพ พพ พพ (สมาชิกครอบครัว) เข้าพักบ้านเลขที่ 1', '2025-10-13 06:51:23', NULL, NULL, NULL, NULL, NULL),
(6, NULL, 2, 'add', 'เพิ่มผู้พักอาศัย: ยศทหาร ภูวดล พานทอง (ผู้ถือสิทธิ) เข้าพักบ้านเลขที่ 2', '2025-10-13 07:10:20', NULL, NULL, NULL, NULL, NULL),
(7, NULL, 2, 'add', 'เพิ่มผู้พักอาศัย: - - - (สมาชิกครอบครัว) เข้าพักบ้านเลขที่ 2', '2025-10-13 07:10:20', NULL, NULL, NULL, NULL, NULL),
(8, NULL, 1, 'add', 'เพิ่มผู้พักอาศัย: ยศทหาร ภูวดล พานทอง (ผู้ถือสิทธิ) เข้าพักบ้านเลขที่ 1', '2025-10-13 17:52:06', NULL, NULL, NULL, NULL, NULL),
(9, NULL, 1, 'edit', 'แก้ไขข้อมูลผู้พักอาศัย ภูวดล พานทอง (บ้านเลขที่ 1) (ไม่มีการเปลี่ยนแปลง)', '2025-10-13 23:58:05', NULL, NULL, NULL, NULL, NULL),
(10, NULL, 14, 'add', 'เพิ่มผู้พักอาศัย: ยศทหาร ภูวดล พานทอง (ผู้ถือสิทธิ) เข้าพักบ้านเลขที่ 1', '2025-10-14 02:48:37', NULL, NULL, NULL, NULL, NULL),
(11, NULL, 14, 'add', 'เพิ่มผู้พักอาศัย: เด็กชาย สน พานทอง (สมาชิกครอบครัว) เข้าพักบ้านเลขที่ 1', '2025-10-14 02:49:03', NULL, NULL, NULL, NULL, NULL),
(12, NULL, 14, 'edit', 'แก้ไขข้อมูลผู้พักอาศัย สน พานทอง (บ้านเลขที่ 1): ยศ: null → นาย', '2025-10-14 02:49:23', NULL, NULL, NULL, NULL, NULL),
(13, NULL, 14, 'add', 'เพิ่มผู้พักอาศัย: ยศทหาร ภูวดล พานทอง (ผู้ถือสิทธิ) เข้าพักบ้านเลขที่ 1', '2025-10-14 03:01:20', NULL, NULL, NULL, NULL, NULL),
(14, NULL, 14, 'add', 'เพิ่มผู้พักอาศัย: เด็กชาย สน พานทอง (สมาชิกครอบครัว) เข้าพักบ้านเลขที่ 1', '2025-10-14 03:01:38', NULL, NULL, NULL, NULL, NULL),
(15, NULL, 15, 'add', 'เพิ่มผู้พักอาศัย: ยศทหาร เพ็ญพรรณ ชื่นฤทัย (ผู้ถือสิทธิ) เข้าพักบ้านเลขที่ 504', '2025-10-14 03:10:01', NULL, NULL, NULL, NULL, NULL),
(16, 13, 1, 'add', 'เพิ่มผู้พักอาศัย: ยศทหาร พพ พพ (ผู้ถือสิทธิ) เข้าพักบ้านเลขที่ 1', '2025-10-14 04:37:20', NULL, NULL, NULL, NULL, NULL),
(17, 13, 1, 'edit', 'แก้ไขข้อมูลผู้พักอาศัย พพ พพ (บ้านเลขที่ 1) (ไม่มีการเปลี่ยนแปลง)', '2025-10-14 06:32:42', NULL, NULL, NULL, NULL, NULL);

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
(1, 13, 'นาย', 'เพน', 'ไไ', 22, 31, NULL, '2025-10-03 08:08:00'),
(3, 1, '', 'ก', 'ำไ', 0, 20, 'ไไไ', '2025-10-12 08:31:56'),
(8, 3, '', 'd', 'd', 0, 13, 'd', '2025-10-14 02:06:19'),
(9, 13, 'นาย', 'สุรบด', 'หลี', 0, 14, 'เข้าหน่อย\n', '2025-10-14 02:08:15'),
(12, 478, 'นาย', 'ภูวดล', 'พานทอง', 0, 1, '2025-04-23', '2025-10-14 04:27:42');

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
(1, 1, '1', 1, NULL, '1760296421227.jpg', '2025-10-12 19:12:59', 1),
(2, 1, '2', 1, NULL, NULL, '2025-10-12 19:12:59', 1),
(3, 1, '3', 2, NULL, NULL, '2025-10-12 19:12:59', 1),
(4, 1, '4', 2, NULL, NULL, '2025-10-12 19:12:59', 1),
(5, 1, '5', 2, NULL, NULL, '2025-10-12 19:12:59', 1),
(6, 1, '6', 2, NULL, NULL, '2025-10-12 19:12:59', 1),
(7, 2, '1', 2, NULL, NULL, '2025-10-13 07:31:39', 3),
(8, 3, '1', 2, NULL, NULL, '2025-10-13 07:31:49', 17),
(9, 179, '1', 2, NULL, NULL, '2025-10-13 07:31:59', 24),
(14, 221, '1', 1, NULL, NULL, '2025-10-14 02:48:14', 30),
(15, 3, '504/30', 1, NULL, NULL, '2025-10-14 03:08:55', 17),
(34, 3, '504/35', 2, NULL, NULL, '2025-10-14 03:22:57', 18),
(35, 3, '504/36', 2, NULL, NULL, '2025-10-14 03:22:57', 18),
(36, 3, '504/37', 2, NULL, NULL, '2025-10-14 03:22:57', 18),
(37, 3, '504/38', 2, NULL, NULL, '2025-10-14 03:22:57', 18),
(38, 3, '504/39', 2, NULL, NULL, '2025-10-14 03:22:57', 18),
(39, 3, '504/40', 2, NULL, NULL, '2025-10-14 03:22:57', 18);

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
(4, 'บ้านพักลูกจ้าง', 'บ้านพักลูกจ้าง', 2, 'อาคาร', '2025-10-03 07:49:02'),
(179, 'คอนโด', '', 3, 'ตึก', '2025-10-12 19:18:53'),
(221, 'บ้านเดี่ยว', '', 3, 'อาคาร', '2025-10-14 02:48:05');

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
(22, 4, 2, 'อาคาร 2', NULL),
(23, 179, 1, 'ตึก 1', NULL),
(24, 179, 2, 'ตึก 2', NULL),
(25, 179, 3, 'ตึก 3', NULL),
(29, 221, 1, 'อาคาร 1', NULL),
(30, 221, 2, 'อาคาร 2', NULL),
(31, 221, 3, 'อาคาร 3', NULL);

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
  `ordering` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `score_criteria`
--

INSERT INTO `score_criteria` (`id`, `label`, `ordering`) VALUES
(1, 'ลักษณะการพักอาศัย', 1),
(2, 'เป็นผู้มีสิทธิ์เบิกค่าเช่าบ้าน', 2),
(3, 'ผู้ขอมีรายได้ทั้งหมด (เงินเดือน)', 3),
(4, 'สถานภาพผู้ขอและคู่สมรส', 4),
(5, 'จำนวนบุตรทั้งหมด', 5),
(6, 'จำนวนบุตรที่อยู่ระหว่างศึกษา', 6),
(7, 'จำนวนบุตรคูณกับระดับการศึกษา', 7),
(8, 'การเจ็บป่วยที่ส่งผลต่อการดำเนินชีวิตอย่างชัดเจน', 8);

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
(1, 1, 'บ้านบิดามารดา', 2, 1),
(2, 1, 'เช่าบ้าน', 5, 2),
(3, 2, 'มีสิทธิ์', 3, 1),
(4, 3, 'มากกว่า 50,000 บาท', 1, 1),
(5, 3, '30,000 - 50,000 บาท', 2, 2),
(6, 3, '15,000 - 30,000 บาท', 3, 3),
(7, 3, 'ต่ำกว่า 15,000 บาท', 5, 4),
(8, 4, 'โสด สมรถแยกพื้นที่ขอ/แยกกันอยู่', 1, 1),
(9, 4, 'โสด อุปการะบิดา - มารดา', 2, 2),
(10, 4, 'สมรสอยู่ด้วยกัน', 3, 3),
(11, 4, 'สมรสอยู่ด้วยกัน อุปการะบิดา - มารดา', 5, 4),
(12, 5, 'ไม่มีบุตร', 1, 1),
(13, 5, '1 คน', 2, 2),
(14, 5, '2 คน', 3, 3),
(15, 5, 'มากกว่า 2 คน', 5, 4),
(16, 6, 'อนุบาล', 1, 1),
(17, 6, 'ประถม', 2, 2),
(18, 6, 'มัธยม', 3, 3),
(19, 6, 'อุดมศึกษา', 5, 4),
(23, 8, 'เจ้าของสิทธิ', 2, 1),
(24, 8, 'บิดา - มารดา', 5, 2);

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
(2, 'Poom', '$2b$10$yuXUXM1pyi3pFhLCp8vZOOIUpAMLJk35YVr9LPtMLpKLsx0T1l0oq', 2, '2025-10-12 19:23:23'),
(4, 'Poom2545', '$2b$10$SaRRLuIJ5sJpN0Jp6OL8tuYJn9fQjSL98bFVR9y6Zos1zr/IoyMKq', 2, '2025-10-14 02:03:01');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `guest_history`
--
ALTER TABLE `guest_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `guest_logs`
--
ALTER TABLE `guest_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `guest_scores`
--
ALTER TABLE `guest_scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `home`
--
ALTER TABLE `home`
  MODIFY `home_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `home_eligibility`
--
ALTER TABLE `home_eligibility`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `home_types`
--
ALTER TABLE `home_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=310;

--
-- AUTO_INCREMENT for table `home_units`
--
ALTER TABLE `home_units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `move_status`
--
ALTER TABLE `move_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `ranks`
--
ALTER TABLE `ranks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=589;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `score_criteria`
--
ALTER TABLE `score_criteria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=312;

--
-- AUTO_INCREMENT for table `score_options`
--
ALTER TABLE `score_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=877;

--
-- AUTO_INCREMENT for table `status`
--
ALTER TABLE `status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT for table `subunit_home`
--
ALTER TABLE `subunit_home`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=147;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
