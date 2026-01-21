ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `pd_tag` VARCHAR(50) DEFAULT 'אין-תג',
ADD COLUMN IF NOT EXISTS `ems_tag` VARCHAR(50) DEFAULT 'אין-תג';

UPDATE `users` 
SET `pd_tag` = 'אין-תג'
WHERE `job` = 'police' AND (`pd_tag` IS NULL OR `pd_tag` = '');

UPDATE `users` 
SET `ems_tag` = 'אין-תג'
WHERE `job` = 'ambulance' AND (`ems_tag` IS NULL OR `ems_tag` = '');

SELECT 'Dispatch tags columns added successfully!' AS Message;