import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Admin
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@igrejaseiva.com.br' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@igrejaseiva.com.br',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // Aluno demo
  const studentHash = await bcrypt.hash('aluno123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'aluno@demo.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'aluno@demo.com',
      passwordHash: studentHash,
      role: 'STUDENT',
    },
  });
  console.log('✅ Aluno demo criado:', student.email);

  // Curso 1
  const curso1 = await prisma.course.upsert({
    where: { slug: 'fundamentos-da-fe' },
    update: {},
    create: {
      title: 'Fundamentos da Fé',
      slug: 'fundamentos-da-fe',
      shortDescription: 'Estabeleça bases sólidas para sua caminhada cristã.',
      description:
        'Um curso completo para quem deseja conhecer mais profundamente os fundamentos da fé cristã. ' +
        'Abordamos temas como salvação, batismo, vida no Espírito, oração e comunhão com Deus.',
      price: 97.0,
      isPublished: true,
    },
  });

  // Módulos do curso 1
  const mod1 = await prisma.module.upsert({
    where: { id: 'mod-fund-1' },
    update: {},
    create: {
      id: 'mod-fund-1',
      courseId: curso1.id,
      title: 'Módulo 1 — Quem é Deus?',
      orderIndex: 1,
    },
  });

  const mod2 = await prisma.module.upsert({
    where: { id: 'mod-fund-2' },
    update: {},
    create: {
      id: 'mod-fund-2',
      courseId: curso1.id,
      title: 'Módulo 2 — A Palavra de Deus',
      orderIndex: 2,
    },
  });

  // Aulas módulo 1
  const aulas1 = [
    { id: 'aula-f1-1', title: 'Introdução ao curso',          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', orderIndex: 1 },
    { id: 'aula-f1-2', title: 'A natureza de Deus',            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', orderIndex: 2 },
    { id: 'aula-f1-3', title: 'Deus Pai, Filho e Espírito Santo', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', orderIndex: 3 },
  ];

  for (const a of aulas1) {
    await prisma.lesson.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, moduleId: mod1.id, videoProvider: 'youtube', isPublished: true },
    });
  }

  // Aulas módulo 2
  const aulas2 = [
    { id: 'aula-f2-1', title: 'A Bíblia e sua autoridade',    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', orderIndex: 1 },
    { id: 'aula-f2-2', title: 'Como estudar a Palavra',       videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', orderIndex: 2 },
  ];

  for (const a of aulas2) {
    await prisma.lesson.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, moduleId: mod2.id, videoProvider: 'youtube', isPublished: true },
    });
  }

  // Curso 2
  const curso2 = await prisma.course.upsert({
    where: { slug: 'vida-de-oracao' },
    update: {},
    create: {
      title: 'Vida de Oração',
      slug: 'vida-de-oracao',
      shortDescription: 'Aprenda a desenvolver uma vida de oração profunda e consistente.',
      description:
        'Neste curso você vai aprender os princípios bíblicos da oração, como criar uma rotina ' +
        'devocional, orar em todas as situações e desenvolver intimidade com Deus.',
      price: 67.0,
      isPublished: true,
    },
  });

  const mod3 = await prisma.module.upsert({
    where: { id: 'mod-ora-1' },
    update: {},
    create: {
      id: 'mod-ora-1',
      courseId: curso2.id,
      title: 'Módulo 1 — O que é oração?',
      orderIndex: 1,
    },
  });

  const aulas3 = [
    { id: 'aula-o1-1', title: 'Oração: diálogo com Deus',       videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', orderIndex: 1 },
    { id: 'aula-o1-2', title: 'O Pai Nosso como modelo',        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', orderIndex: 2 },
    { id: 'aula-o1-3', title: 'Criando sua rotina devocional',  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', orderIndex: 3 },
  ];

  for (const a of aulas3) {
    await prisma.lesson.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, moduleId: mod3.id, videoProvider: 'youtube', isPublished: true },
    });
  }

  // Matricular aluno no curso 1
  await prisma.studentCourse.upsert({
    where: { userId_courseId: { userId: student.id, courseId: curso1.id } },
    update: {},
    create: { userId: student.id, courseId: curso1.id, accessStatus: 'ACTIVE' },
  });

  // Progresso inicial do aluno
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: student.id, lessonId: 'aula-f1-1' } },
    update: {},
    create: { userId: student.id, lessonId: 'aula-f1-1', completed: true, completedAt: new Date() },
  });

  console.log('✅ Cursos e dados de exemplo criados.');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   Admin  → admin@igrejaseiva.com.br  / admin123');
  console.log('   Aluno  → aluno@demo.com            / aluno123');
  console.log('\n🎉 Seed concluído!');
}

main()
  .catch(e => { console.error('❌ Erro no seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
