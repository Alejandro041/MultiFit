const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usamos la clave de Service Role para el back-end
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint de prueba
app.get('/', (req, res) => {
  res.send('Servidor Multifit funcionando!');
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      // Supabase maneja los errores de autenticación (ej. credenciales inválidas)
      return res.status(401).json({ error: error.message });
    }

    // Si el login es exitoso, obtenemos el token de sesión y el ID del usuario
    const session = data.session;
    const user = data.user;

    // Con el ID del usuario, obtenemos su rol para poder usarlo en el front-end
    const { data: userData, error: userError } = await supabase
      .from('usuario')
      .select('rol (name)')
      .eq('id', user.id)
      .single();

    if (userError) {
      return res.status(500).json({ error: 'Error al obtener el rol del usuario.' });
    }

    // Respondemos con el token de sesión, el ID de usuario y el rol
    res.json({
      access_token: session.access_token,
      user_id: user.id,
      rol: userData.rol.name,
    });

  } catch (err) {
    console.error('Error en la autenticación:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

app.get('/api/gyms', async (req, res) => {
  try {
    const { data: gyms, error } = await supabase.from('gyms').select('*');

    if (error) {
      console.error('Error al obtener los gimnasios:', error.message);
      return res.status(500).json({ error: 'Error del servidor al obtener la lista de gimnasios.' });
    }

    res.json(gyms);
  } catch (err) {
    console.error('Error en la ruta de gimnasios:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

app.get('/api/gym/:gymId/members', async (req, res) => {
  const { gymId } = req.params;

  try {
    const { data: members, error } = await supabase
      .from('persona')
      .select('*, usuario!inner(rol_id)')
      .eq('gym_id', gymId)
      .not('usuario.rol_id', 'eq', 'ID_DEL_SUPERADMIN'); // No queremos ver al superadmin en la lista de miembros

    if (error) {
      console.error('Error al obtener los miembros:', error);
      return res.status(500).json({ error: 'Error del servidor al obtener la lista de miembros.' });
    }

    res.json(members);
  } catch (err) {
    console.error('Error en la ruta de miembros:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});