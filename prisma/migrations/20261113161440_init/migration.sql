-- CreateTable
CREATE TABLE `Servico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente` VARCHAR(100) NOT NULL,
    `veiculo` VARCHAR(100) NOT NULL,
    `placa` VARCHAR(10) NOT NULL,
    `descricao` TEXT NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
