-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 28, 2025 at 09:41 AM
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
(452, 'พลเรือตรี'),
(453, 'พลเรือตรีหญิง'),
(450, 'พลเรือโท'),
(451, 'พลเรือโทหญิง'),
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

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ranks`
--
ALTER TABLE `ranks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ranks`
--
ALTER TABLE `ranks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2329;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
