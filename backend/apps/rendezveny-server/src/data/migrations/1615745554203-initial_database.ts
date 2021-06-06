import {MigrationInterface, QueryRunner} from "typeorm";

export class initialDatabase1615745554203 implements MigrationInterface {
    name = 'initialDatabase1615745554203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `local_identity` (`username` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `salt` varchar(255) NOT NULL, `passwordVersion` int NOT NULL, `userId` varchar(255) NULL, UNIQUE INDEX `IDX_9c3f7bdeb3b8ac4e3ba993e816` (`email`), UNIQUE INDEX `REL_508c1cae83c82e51b9bf846c33` (`userId`), PRIMARY KEY (`username`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `temporary_identity` (`token` varchar(36) NOT NULL, `email` varchar(255) NOT NULL, `name` varchar(255) NULL, PRIMARY KEY (`token`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `registration` (`id` varchar(36) NOT NULL, `eventId` varchar(255) NOT NULL, `userId` varchar(255) NOT NULL, `registrationDate` timestamp NULL, `attendDate` timestamp NULL, `notificationSettings` enum ('0', '1', '2', '4', '8', '16', '32', '65535') NOT NULL, `temporaryIdentityToken` varchar(255) NULL, UNIQUE INDEX `REL_e393e1c9318f5f5ad6f1304ff4` (`temporaryIdentityToken`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `form_question_answer` (`formQuestionId` varchar(255) NOT NULL, `registrationId` varchar(255) NOT NULL, `answer` json NOT NULL, PRIMARY KEY (`formQuestionId`, `registrationId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `form_question` (`id` varchar(36) NOT NULL, `question` varchar(255) NOT NULL, `isRequired` tinyint NOT NULL, `type` enum ('0', '1') NOT NULL, `typeMetadata` json NOT NULL, `order` int NOT NULL, `eventId` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `form_question_template` (`id` varchar(36) NOT NULL, `question` varchar(255) NOT NULL, `type` enum ('0', '1') NOT NULL, `typeMetadata` json NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `tag` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, UNIQUE INDEX `IDX_6a9775008add570dc3e5a0bab7` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `hr_table` (`id` varchar(36) NOT NULL, `isLocked` tinyint NOT NULL, `eventId` varchar(255) NOT NULL, UNIQUE INDEX `REL_9d9e9759f9ee6558367ac1e8a9` (`eventId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `hr_task` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `start` timestamp NOT NULL, `end` timestamp NOT NULL, `order` int NOT NULL, `isLocked` tinyint NOT NULL, `hrTableId` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `hr_segment` (`id` varchar(36) NOT NULL, `capacity` int NOT NULL, `isRequired` tinyint NOT NULL, `start` timestamp NOT NULL, `end` timestamp NOT NULL, `isLocked` tinyint NOT NULL, `hrTaskId` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `organizer` (`id` varchar(36) NOT NULL, `eventId` varchar(255) NOT NULL, `userId` varchar(255) NOT NULL, `isChief` tinyint NOT NULL, `notificationSettings` enum ('0', '1', '2', '4', '8', '16', '32', '65535') NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `event` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `uniqueName` varchar(255) NOT NULL, `description` text NOT NULL, `place` varchar(255) NULL, `capacity` int NULL, `start` timestamp NULL, `end` timestamp NULL, `isDateOrTime` tinyint NOT NULL, `registrationStart` timestamp NULL, `registrationEnd` timestamp NULL, `registrationAllowed` tinyint NULL, `isClosedEvent` tinyint NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `club` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `externalId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `club_membership` (`clubId` varchar(255) NOT NULL, `userId` varchar(255) NOT NULL, `clubRole` enum ('0', '1') NOT NULL, PRIMARY KEY (`clubId`, `userId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `refresh_token` (`id` varchar(36) NOT NULL, `userId` varchar(255) NOT NULL, PRIMARY KEY (`id`, `userId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `role` enum ('0', '1') NOT NULL, `isSuspended` tinyint NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `auth_sch_identity` (`externalId` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `userId` varchar(255) NULL, UNIQUE INDEX `REL_5e45a96dd81c27aeb7faeff879` (`userId`), PRIMARY KEY (`externalId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `log` (`id` varchar(36) NOT NULL, `at` timestamp NOT NULL, `issuer` json NOT NULL, `query` varchar(255) NOT NULL, `args` json NOT NULL, `result` enum ('0', '1', '2', '3') NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `tag_events_event` (`tagId` varchar(255) NOT NULL, `eventId` varchar(255) NOT NULL, INDEX `IDX_bf38287323e91e9dfc2a492ffe` (`tagId`), INDEX `IDX_dd502c817c477cc2b229af6a83` (`eventId`), PRIMARY KEY (`tagId`, `eventId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `tag_form_question_templates_form_question_template` (`tagId` varchar(255) NOT NULL, `formQuestionTemplateId` varchar(255) NOT NULL, INDEX `IDX_df4b3957c8e2ed94633ec61bb6` (`tagId`), INDEX `IDX_8d36f8b979dec8477e3bbf43bc` (`formQuestionTemplateId`), PRIMARY KEY (`tagId`, `formQuestionTemplateId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `hr_segment_organizers_organizer` (`hrSegmentId` varchar(255) NOT NULL, `organizerId` varchar(255) NOT NULL, INDEX `IDX_2ce036e6d5fbc890c69814db7f` (`hrSegmentId`), INDEX `IDX_df84d0b5ce402f45e4b29203bf` (`organizerId`), PRIMARY KEY (`hrSegmentId`, `organizerId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `event_hosting_clubs_club` (`eventId` varchar(255) NOT NULL, `clubId` varchar(255) NOT NULL, INDEX `IDX_e53a3f49f848d8d4e9848b5438` (`eventId`), INDEX `IDX_6e6262944808ea974883e7e9b5` (`clubId`), PRIMARY KEY (`eventId`, `clubId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `local_identity` ADD CONSTRAINT `FK_508c1cae83c82e51b9bf846c339` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `registration` ADD CONSTRAINT `FK_c9cbfae000488578b2bb322c8bd` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `registration` ADD CONSTRAINT `FK_af6d07a8391d587c4dd40e7a5a9` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `registration` ADD CONSTRAINT `FK_e393e1c9318f5f5ad6f1304ff4a` FOREIGN KEY (`temporaryIdentityToken`) REFERENCES `temporary_identity`(`token`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `form_question_answer` ADD CONSTRAINT `FK_a508d43ada717900b7559ab1b61` FOREIGN KEY (`formQuestionId`) REFERENCES `form_question`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `form_question_answer` ADD CONSTRAINT `FK_0101362dbab21d2330c314416d5` FOREIGN KEY (`registrationId`) REFERENCES `registration`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `form_question` ADD CONSTRAINT `FK_6a9c566a67baf4b89f43f4ca361` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `hr_table` ADD CONSTRAINT `FK_9d9e9759f9ee6558367ac1e8a91` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `hr_task` ADD CONSTRAINT `FK_10127fb826fa26afc542f488fec` FOREIGN KEY (`hrTableId`) REFERENCES `hr_table`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `hr_segment` ADD CONSTRAINT `FK_eab94fcf711d2f8a513c3158958` FOREIGN KEY (`hrTaskId`) REFERENCES `hr_task`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `organizer` ADD CONSTRAINT `FK_ddbaa7ff684a0b8979d4b9b0908` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `organizer` ADD CONSTRAINT `FK_c804f867dbd19cc0cccd61a4a4c` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `club_membership` ADD CONSTRAINT `FK_c36b17947c5a3dcb319707f0bf0` FOREIGN KEY (`clubId`) REFERENCES `club`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `club_membership` ADD CONSTRAINT `FK_6877db858accbe1f93c976e49b2` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `refresh_token` ADD CONSTRAINT `FK_8e913e288156c133999341156ad` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `auth_sch_identity` ADD CONSTRAINT `FK_5e45a96dd81c27aeb7faeff879e` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `tag_events_event` ADD CONSTRAINT `FK_bf38287323e91e9dfc2a492ffe3` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `tag_events_event` ADD CONSTRAINT `FK_dd502c817c477cc2b229af6a839` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `tag_form_question_templates_form_question_template` ADD CONSTRAINT `FK_df4b3957c8e2ed94633ec61bb64` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `tag_form_question_templates_form_question_template` ADD CONSTRAINT `FK_8d36f8b979dec8477e3bbf43bc6` FOREIGN KEY (`formQuestionTemplateId`) REFERENCES `form_question_template`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `hr_segment_organizers_organizer` ADD CONSTRAINT `FK_2ce036e6d5fbc890c69814db7fa` FOREIGN KEY (`hrSegmentId`) REFERENCES `hr_segment`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `hr_segment_organizers_organizer` ADD CONSTRAINT `FK_df84d0b5ce402f45e4b29203bf8` FOREIGN KEY (`organizerId`) REFERENCES `organizer`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `event_hosting_clubs_club` ADD CONSTRAINT `FK_e53a3f49f848d8d4e9848b54381` FOREIGN KEY (`eventId`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `event_hosting_clubs_club` ADD CONSTRAINT `FK_6e6262944808ea974883e7e9b5f` FOREIGN KEY (`clubId`) REFERENCES `club`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `event_hosting_clubs_club` DROP FOREIGN KEY `FK_6e6262944808ea974883e7e9b5f`");
        await queryRunner.query("ALTER TABLE `event_hosting_clubs_club` DROP FOREIGN KEY `FK_e53a3f49f848d8d4e9848b54381`");
        await queryRunner.query("ALTER TABLE `hr_segment_organizers_organizer` DROP FOREIGN KEY `FK_df84d0b5ce402f45e4b29203bf8`");
        await queryRunner.query("ALTER TABLE `hr_segment_organizers_organizer` DROP FOREIGN KEY `FK_2ce036e6d5fbc890c69814db7fa`");
        await queryRunner.query("ALTER TABLE `tag_form_question_templates_form_question_template` DROP FOREIGN KEY `FK_8d36f8b979dec8477e3bbf43bc6`");
        await queryRunner.query("ALTER TABLE `tag_form_question_templates_form_question_template` DROP FOREIGN KEY `FK_df4b3957c8e2ed94633ec61bb64`");
        await queryRunner.query("ALTER TABLE `tag_events_event` DROP FOREIGN KEY `FK_dd502c817c477cc2b229af6a839`");
        await queryRunner.query("ALTER TABLE `tag_events_event` DROP FOREIGN KEY `FK_bf38287323e91e9dfc2a492ffe3`");
        await queryRunner.query("ALTER TABLE `auth_sch_identity` DROP FOREIGN KEY `FK_5e45a96dd81c27aeb7faeff879e`");
        await queryRunner.query("ALTER TABLE `refresh_token` DROP FOREIGN KEY `FK_8e913e288156c133999341156ad`");
        await queryRunner.query("ALTER TABLE `club_membership` DROP FOREIGN KEY `FK_6877db858accbe1f93c976e49b2`");
        await queryRunner.query("ALTER TABLE `club_membership` DROP FOREIGN KEY `FK_c36b17947c5a3dcb319707f0bf0`");
        await queryRunner.query("ALTER TABLE `organizer` DROP FOREIGN KEY `FK_c804f867dbd19cc0cccd61a4a4c`");
        await queryRunner.query("ALTER TABLE `organizer` DROP FOREIGN KEY `FK_ddbaa7ff684a0b8979d4b9b0908`");
        await queryRunner.query("ALTER TABLE `hr_segment` DROP FOREIGN KEY `FK_eab94fcf711d2f8a513c3158958`");
        await queryRunner.query("ALTER TABLE `hr_task` DROP FOREIGN KEY `FK_10127fb826fa26afc542f488fec`");
        await queryRunner.query("ALTER TABLE `hr_table` DROP FOREIGN KEY `FK_9d9e9759f9ee6558367ac1e8a91`");
        await queryRunner.query("ALTER TABLE `form_question` DROP FOREIGN KEY `FK_6a9c566a67baf4b89f43f4ca361`");
        await queryRunner.query("ALTER TABLE `form_question_answer` DROP FOREIGN KEY `FK_0101362dbab21d2330c314416d5`");
        await queryRunner.query("ALTER TABLE `form_question_answer` DROP FOREIGN KEY `FK_a508d43ada717900b7559ab1b61`");
        await queryRunner.query("ALTER TABLE `registration` DROP FOREIGN KEY `FK_e393e1c9318f5f5ad6f1304ff4a`");
        await queryRunner.query("ALTER TABLE `registration` DROP FOREIGN KEY `FK_af6d07a8391d587c4dd40e7a5a9`");
        await queryRunner.query("ALTER TABLE `registration` DROP FOREIGN KEY `FK_c9cbfae000488578b2bb322c8bd`");
        await queryRunner.query("ALTER TABLE `local_identity` DROP FOREIGN KEY `FK_508c1cae83c82e51b9bf846c339`");
        await queryRunner.query("DROP INDEX `IDX_6e6262944808ea974883e7e9b5` ON `event_hosting_clubs_club`");
        await queryRunner.query("DROP INDEX `IDX_e53a3f49f848d8d4e9848b5438` ON `event_hosting_clubs_club`");
        await queryRunner.query("DROP TABLE `event_hosting_clubs_club`");
        await queryRunner.query("DROP INDEX `IDX_df84d0b5ce402f45e4b29203bf` ON `hr_segment_organizers_organizer`");
        await queryRunner.query("DROP INDEX `IDX_2ce036e6d5fbc890c69814db7f` ON `hr_segment_organizers_organizer`");
        await queryRunner.query("DROP TABLE `hr_segment_organizers_organizer`");
        await queryRunner.query("DROP INDEX `IDX_8d36f8b979dec8477e3bbf43bc` ON `tag_form_question_templates_form_question_template`");
        await queryRunner.query("DROP INDEX `IDX_df4b3957c8e2ed94633ec61bb6` ON `tag_form_question_templates_form_question_template`");
        await queryRunner.query("DROP TABLE `tag_form_question_templates_form_question_template`");
        await queryRunner.query("DROP INDEX `IDX_dd502c817c477cc2b229af6a83` ON `tag_events_event`");
        await queryRunner.query("DROP INDEX `IDX_bf38287323e91e9dfc2a492ffe` ON `tag_events_event`");
        await queryRunner.query("DROP TABLE `tag_events_event`");
        await queryRunner.query("DROP TABLE `log`");
        await queryRunner.query("DROP INDEX `REL_5e45a96dd81c27aeb7faeff879` ON `auth_sch_identity`");
        await queryRunner.query("DROP TABLE `auth_sch_identity`");
        await queryRunner.query("DROP TABLE `user`");
        await queryRunner.query("DROP TABLE `refresh_token`");
        await queryRunner.query("DROP TABLE `club_membership`");
        await queryRunner.query("DROP TABLE `club`");
        await queryRunner.query("DROP TABLE `event`");
        await queryRunner.query("DROP TABLE `organizer`");
        await queryRunner.query("DROP TABLE `hr_segment`");
        await queryRunner.query("DROP TABLE `hr_task`");
        await queryRunner.query("DROP INDEX `REL_9d9e9759f9ee6558367ac1e8a9` ON `hr_table`");
        await queryRunner.query("DROP TABLE `hr_table`");
        await queryRunner.query("DROP INDEX `IDX_6a9775008add570dc3e5a0bab7` ON `tag`");
        await queryRunner.query("DROP TABLE `tag`");
        await queryRunner.query("DROP TABLE `form_question_template`");
        await queryRunner.query("DROP TABLE `form_question`");
        await queryRunner.query("DROP TABLE `form_question_answer`");
        await queryRunner.query("DROP INDEX `REL_e393e1c9318f5f5ad6f1304ff4` ON `registration`");
        await queryRunner.query("DROP TABLE `registration`");
        await queryRunner.query("DROP TABLE `temporary_identity`");
        await queryRunner.query("DROP INDEX `REL_508c1cae83c82e51b9bf846c33` ON `local_identity`");
        await queryRunner.query("DROP INDEX `IDX_9c3f7bdeb3b8ac4e3ba993e816` ON `local_identity`");
        await queryRunner.query("DROP TABLE `local_identity`");
    }

}
