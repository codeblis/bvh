-- PROFILES: cada quien lee/edita su propio perfil; lectura pública de datos básicos de autores
create policy "Perfiles visibles públicamente" on public.profiles for select to anon, authenticated using (true);
create policy "El usuario edita su propio perfil" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "El usuario inserta su propio perfil" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- CATEGORIES: lectura pública
create policy "Categorías visibles públicamente" on public.categories for select to anon, authenticated using (true);

-- ARTICLES: lectura pública solo de publicados; autores ven/editan lo suyo
create policy "Artículos publicados son públicos" on public.articles for select to anon, authenticated using (status = 'publicado');
create policy "El autor ve sus propios borradores" on public.articles for select to authenticated using (auth.uid() = author_id);
create policy "El autor gestiona sus artículos" on public.articles for insert to authenticated with check (auth.uid() = author_id);
create policy "El autor actualiza sus artículos" on public.articles for update to authenticated using (auth.uid() = author_id);

-- COMMENTS: lectura pública de aprobados; usuarios autenticados comentan
create policy "Comentarios aprobados son públicos" on public.comments for select to anon, authenticated using (status = 'aprobado');
create policy "El usuario ve sus propios comentarios" on public.comments for select to authenticated using (auth.uid() = user_id);
create policy "Usuarios autenticados comentan" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "El usuario edita sus comentarios" on public.comments for update to authenticated using (auth.uid() = user_id);
create policy "El usuario borra sus comentarios" on public.comments for delete to authenticated using (auth.uid() = user_id);

-- LIKES
create policy "Likes visibles públicamente" on public.likes for select to anon, authenticated using (true);
create policy "Usuarios autenticados dan like" on public.likes for insert to authenticated with check (auth.uid() = user_id);
create policy "El usuario quita su like" on public.likes for delete to authenticated using (auth.uid() = user_id);

-- BOOKMARKS: privados del usuario
create policy "El usuario ve sus bookmarks" on public.bookmarks for select to authenticated using (auth.uid() = user_id);
create policy "El usuario guarda bookmarks" on public.bookmarks for insert to authenticated with check (auth.uid() = user_id);
create policy "El usuario quita bookmarks" on public.bookmarks for delete to authenticated using (auth.uid() = user_id);

-- COURSES: lectura pública de activos
create policy "Cursos activos son públicos" on public.courses for select to anon, authenticated using (status = 'activo');

-- COURSE_ENROLLMENTS: privados del usuario
create policy "El usuario ve sus inscripciones" on public.course_enrollments for select to authenticated using (auth.uid() = user_id);
create policy "El usuario se inscribe" on public.course_enrollments for insert to authenticated with check (auth.uid() = user_id);

-- COMPANIES: registro público (directorio de empresas listadas/interesadas)
create policy "Empresas visibles públicamente" on public.companies for select to anon, authenticated using (true);

-- INDICES: lectura pública
create policy "Índices visibles públicamente" on public.indices for select to anon, authenticated using (true);

-- NEWSLETTER: cualquiera se suscribe, nadie lee de vuelta desde el cliente
create policy "Cualquiera se suscribe al newsletter" on public.newsletter_subscriptions for insert to anon, authenticated with check (true);

-- CONTACT MESSAGES: cualquiera puede enviar un mensaje de contacto
create policy "Cualquiera envía un mensaje de contacto" on public.contact_messages for insert to anon, authenticated with check (true);
