/*
 Navicat Premium Data Transfer

 Source Server         : t
 Source Server Type    : MySQL
 Source Server Version : 80015
 Source Host           : localhost:3306
 Source Schema         : gen

 Target Server Type    : MySQL
 Target Server Version : 80015
 File Encoding         : 65001

 Date: 26/03/2019 22:16:51
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for app
-- ----------------------------
DROP TABLE IF EXISTS `app`;
CREATE TABLE `app` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT '',
  `label` varchar(255) DEFAULT NULL,
  `desc` text,
  `inter_app_id` int(11) DEFAULT NULL,
  `base_url` varchar(255) DEFAULT '',
  `scaffold_id` int(11) DEFAULT NULL,
  `layout_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=53 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for component
-- ----------------------------
DROP TABLE IF EXISTS `component`;
CREATE TABLE `component` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` int(11) DEFAULT NULL,
  `dependent` int(11) DEFAULT NULL,
  `template_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `desc` varchar(255) DEFAULT NULL,
  `template` text,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=201 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for component_extra_field
-- ----------------------------
DROP TABLE IF EXISTS `component_extra_field`;
CREATE TABLE `component_extra_field` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `component_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `label` text,
  `desc` text,
  `type` varchar(255) DEFAULT NULL,
  `value_type` varchar(255) DEFAULT NULL,
  `options` text,
  `default_value` text,
  `sort` varchar(255) DEFAULT NULL,
  `required` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=349 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for extra_template
-- ----------------------------
DROP TABLE IF EXISTS `extra_template`;
CREATE TABLE `extra_template` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module` varchar(255) DEFAULT NULL,
  `module_instance_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `desc` text,
  `dir` varchar(255) DEFAULT NULL,
  `template` text,
  `sort` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for field
-- ----------------------------
DROP TABLE IF EXISTS `field`;
CREATE TABLE `field` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `template` text,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for icon
-- ----------------------------
DROP TABLE IF EXISTS `icon`;
CREATE TABLE `icon` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for inter
-- ----------------------------
DROP TABLE IF EXISTS `inter`;
CREATE TABLE `inter` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `inter_app_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `desc` varchar(255) DEFAULT NULL,
  `cate_id` int(11) DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `header` text NOT NULL,
  `req` text NOT NULL,
  `res_header` text NOT NULL,
  `res` text NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `comments` text NOT NULL,
  `source` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for inter_app
-- ----------------------------
DROP TABLE IF EXISTS `inter_app`;
CREATE TABLE `inter_app` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `desc` varchar(255) DEFAULT NULL,
  `base_url` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for inter_cate
-- ----------------------------
DROP TABLE IF EXISTS `inter_cate`;
CREATE TABLE `inter_cate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` int(11) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `desc` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for layout
-- ----------------------------
DROP TABLE IF EXISTS `layout`;
CREATE TABLE `layout` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scaffold_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `desc` varchar(255) DEFAULT NULL,
  `template` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for page
-- ----------------------------
DROP TABLE IF EXISTS `page`;
CREATE TABLE `page` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_id` int(11) DEFAULT NULL,
  `pid` int(11) DEFAULT NULL,
  `inter_id` int(11) DEFAULT NULL,
  `template_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `desc` varchar(255) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for page_component
-- ----------------------------
DROP TABLE IF EXISTS `page_component`;
CREATE TABLE `page_component` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_id` int(11) DEFAULT NULL,
  `template_id` int(11) DEFAULT NULL,
  `inter_id` int(11) DEFAULT NULL,
  `content` text,
  `sort` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=148 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for page_template
-- ----------------------------
DROP TABLE IF EXISTS `page_template`;
CREATE TABLE `page_template` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_id` int(11) DEFAULT NULL,
  `template_id` int(11) DEFAULT NULL,
  `inter_id` int(11) DEFAULT NULL,
  `content` text,
  `sort` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=272 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for scaffold
-- ----------------------------
DROP TABLE IF EXISTS `scaffold`;
CREATE TABLE `scaffold` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `desc` varchar(255) DEFAULT NULL,
  `file` varchar(255) DEFAULT NULL,
  `router_file_path` varchar(255) DEFAULT NULL,
  `router_template` text,
  `menu_file_path` varchar(255) DEFAULT NULL,
  `menu_template` text,
  `page_dir` varchar(255) DEFAULT NULL,
  `store_template` text,
  `store_dir` varchar(255) DEFAULT NULL,
  `service_template` text,
  `service_dir` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for template
-- ----------------------------
DROP TABLE IF EXISTS `template`;
CREATE TABLE `template` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scaffold_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `desc` varchar(255) DEFAULT NULL,
  `cate_id` int(11) DEFAULT NULL,
  `template` text,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=103 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for template_cate
-- ----------------------------
DROP TABLE IF EXISTS `template_cate`;
CREATE TABLE `template_cate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` int(11) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `desc` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for template_extra_field
-- ----------------------------
DROP TABLE IF EXISTS `template_extra_field`;
CREATE TABLE `template_extra_field` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `label` text,
  `desc` text,
  `type` varchar(255) DEFAULT NULL,
  `value_type` varchar(255) DEFAULT NULL,
  `options` text,
  `default_value` text,
  `sort` varchar(255) DEFAULT NULL,
  `required` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) DEFAULT NULL,
  `user_pass` varchar(255) DEFAULT NULL,
  `user_nicename` varchar(255) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_url` varchar(255) DEFAULT NULL,
  `user_registered` datetime DEFAULT NULL,
  `user_activation_key` varchar(255) DEFAULT NULL,
  `user_status` int(11) DEFAULT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for valid
-- ----------------------------
DROP TABLE IF EXISTS `valid`;
CREATE TABLE `valid` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `desc` varchar(255) DEFAULT NULL,
  `rule` varchar(255) DEFAULT NULL,
  `error_msg` varchar(255) DEFAULT NULL,
  `success_msg` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=75 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;
