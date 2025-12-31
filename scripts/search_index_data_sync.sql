INSERT INTO search_index (title, type, target_id, project_id, user_id, hierarchy)
SELECT title, 'project', id, id, user_id, '| ' || title || ' |' 
FROM projects;

INSERT INTO search_index (title, type, target_id, project_id, user_id, hierarchy)
SELECT d.title, 'document', d.id, d.project_id, d.user_id, '| ' || p.title || ' | ' || d.title || ' |'
FROM project_documents d
JOIN projects p ON p.id = d.project_id;

INSERT INTO search_index (title, type, target_id, project_id, user_id, hierarchy)
SELECT b.title, 'board', b.id, b.project_id, b.user_id, '| ' || p.title || ' | ' || b.title || ' |'
FROM project_boards b
JOIN projects p ON p.id = b.project_id;

INSERT INTO search_index (title, type, target_id, project_id, user_id, hierarchy)
SELECT s.title, 'section', s.id, b.project_id, s.user_id, '| ' || b.title || ' | ' || s.title || ' |'
FROM project_board_sections s
JOIN project_boards b ON b.id = s.board_id;

INSERT INTO search_index (title, type, target_id, project_id, user_id, hierarchy)
SELECT i.title, 'item', i.id, b.project_id, i.user_id, '| ' || s.title || ' | ' || i.title || ' |'
FROM project_board_items i
JOIN project_board_sections s ON s.id = i.section_id
JOIN project_boards b ON b.id = s.board_id;

INSERT INTO search_index (title, type, target_id, project_id, user_id, hierarchy)
SELECT ci.title, 'check_item', ci.id, b.project_id, ci.user_id, '| ' || i.title || ' | ' || ci.title || ' |'
FROM project_board_check_items ci
JOIN project_board_items i ON i.id = ci.item_id
JOIN project_board_sections s ON s.id = i.section_id
JOIN project_boards b ON b.id = s.board_id;