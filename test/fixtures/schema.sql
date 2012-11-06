SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

DROP SCHEMA IF EXISTS `mysql-validator` ;
CREATE SCHEMA IF NOT EXISTS `mysql-validator` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `mysql-validator` ;

-- -----------------------------------------------------
-- Table `datatypes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `datatypes` ;

CREATE  TABLE IF NOT EXISTS `datatypes` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `date` DATE NULL ,
  `time` TIME NULL ,
  `datetime` DATETIME NULL ,
  `timestamp` TIMESTAMP NULL ,
  `year` YEAR NULL ,
  `bigint` BIGINT NULL ,
  `bigint unsigned` BIGINT UNSIGNED NULL ,
  `int` INT NULL ,
  `int unsigned` INT UNSIGNED NULL ,
  `int zerofill` INT ZEROFILL NULL ,
  `mediumint` MEDIUMINT NULL ,
  `mediumint unsigned` MEDIUMINT UNSIGNED NULL ,
  `smallint` SMALLINT NULL ,
  `smallint unsigned` SMALLINT UNSIGNED NULL ,
  `tinyint` TINYINT NULL ,
  `tinyint unsigned` TINYINT UNSIGNED NULL ,
  `bit` BIT NULL ,
  `float` FLOAT NULL ,
  `double` DOUBLE NULL ,
  `decimal` DECIMAL NULL ,
  `numeric` DECIMAL(10,0) NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
