-- https://sqlite.org/fts5.html

-- 1. Create the Virtual Table (FTS5)
DROP TABLE IF EXISTS search_index;
--> statement-breakpoint
CREATE VIRTUAL TABLE search_index USING fts5(
    title,
    type,
    target_id UNINDEXED,
    project_id UNINDEXED,
    user_id UNINDEXED,
    hierarchy,
    tokenize='trigram remove_diacritics 1'
);
--> statement-breakpoint

-- ==========================================
-- 2. INSERT TRIGGERS
-- ==========================================

CREATE TRIGGER projects_ai AFTER INSERT ON projects BEGIN
    INSERT INTO search_index(title, type, target_id, project_id, user_id, hierarchy)
    VALUES (new.title, 'project', new.id, new.id, new.user_id, '| ' || new.title || ' |');
END;
--> statement-breakpoint

CREATE TRIGGER documents_ai AFTER INSERT ON project_documents BEGIN
    INSERT INTO search_index(title, type, target_id, project_id, user_id, hierarchy)
    SELECT new.title, 'document', new.id, new.project_id, new.user_id, '| ' || p.title || ' | ' || new.title || ' |'
    FROM projects p WHERE p.id = new.project_id;
END;
--> statement-breakpoint

CREATE TRIGGER boards_ai AFTER INSERT ON project_boards BEGIN
    INSERT INTO search_index(title, type, target_id, project_id, user_id, hierarchy)
    SELECT new.title, 'board', new.id, new.project_id, new.user_id, '| ' || p.title || ' | ' || new.title || ' |'
    FROM projects p WHERE p.id = new.project_id;
END;
--> statement-breakpoint

CREATE TRIGGER sections_ai AFTER INSERT ON project_board_sections BEGIN
    INSERT INTO search_index(title, type, target_id, project_id, user_id, hierarchy)
    SELECT new.title, 'section', new.id, b.project_id, new.user_id, '| ' || b.title || ' | ' || new.title || ' |'
    FROM project_boards b WHERE b.id = new.board_id;
END;
--> statement-breakpoint

CREATE TRIGGER items_ai AFTER INSERT ON project_board_items BEGIN
    INSERT INTO search_index(title, type, target_id, project_id, user_id, hierarchy)
    SELECT new.title, 'item', new.id, b.project_id, new.user_id, '| ' || s.title || ' | ' || new.title || ' |'
    FROM project_board_sections s JOIN project_boards b ON b.id = s.board_id WHERE s.id = new.section_id;
END;
--> statement-breakpoint

CREATE TRIGGER check_items_ai AFTER INSERT ON project_board_check_items BEGIN
    INSERT INTO search_index(title, type, target_id, project_id, user_id, hierarchy)
    SELECT new.title, 'check_item', new.id, b.project_id, new.user_id, '| ' || i.title || ' | ' || new.title || ' |'
    FROM project_board_items i JOIN project_board_sections s ON s.id = i.section_id JOIN project_boards b ON b.id = s.board_id
    WHERE i.id = new.item_id;
END;
--> statement-breakpoint

-- ==========================================
-- 3. UPDATE TRIGGERS (rebuild pattern)
-- ==========================================

-- PROJECT: Only updates its own entry and the first level children
CREATE TRIGGER projects_au AFTER UPDATE ON projects 
FOR EACH ROW WHEN old.title != new.title BEGIN
    UPDATE search_index SET title = new.title, hierarchy = '| ' || new.title || ' |' WHERE target_id = old.id AND type = 'project';
    
    -- Only update hierarchies for documents and boards (level 1)
    UPDATE search_index 
    SET hierarchy = '| ' || new.title || ' | ' || title || ' |'
    WHERE project_id = old.id AND type IN ('document', 'board');
END;
--> statement-breakpoint

-- BOARD: Updates itself and its immediate children (sections)
CREATE TRIGGER boards_au AFTER UPDATE ON project_boards 
FOR EACH ROW WHEN old.title != new.title OR old.project_id != new.project_id BEGIN
    UPDATE search_index SET title = new.title, project_id = new.project_id,
        hierarchy = (SELECT '| ' || p.title || ' | ' || new.title || ' |' FROM projects p WHERE p.id = new.project_id)
    WHERE target_id = old.id AND type = 'board';

    -- Update child sections hierarchy to use this board's new title
    UPDATE search_index SET hierarchy = '| ' || new.title || ' | ' || title || ' |'
    WHERE type = 'section' AND target_id IN (SELECT id FROM project_board_sections WHERE board_id = old.id);
END;
--> statement-breakpoint

-- SECTION: Updates itself and its immediate children (items)
CREATE TRIGGER sections_au AFTER UPDATE ON project_board_sections 
FOR EACH ROW WHEN old.title != new.title OR old.board_id != new.board_id BEGIN
    UPDATE search_index SET title = new.title,
        hierarchy = (SELECT '| ' || b.title || ' | ' || new.title || ' |' FROM project_boards b WHERE b.id = new.board_id)
    WHERE target_id = old.id AND type = 'section';

    -- Update child items hierarchy to use this section's new title
    UPDATE search_index SET hierarchy = '| ' || new.title || ' | ' || title || ' |'
    WHERE type = 'item' AND target_id IN (SELECT id FROM project_board_items WHERE section_id = old.id);
END;
--> statement-breakpoint

-- ITEM: Updates itself and its immediate children (check items)
CREATE TRIGGER items_au AFTER UPDATE ON project_board_items 
FOR EACH ROW WHEN old.title != new.title OR old.section_id != new.section_id BEGIN
    UPDATE search_index SET title = new.title,
        hierarchy = (SELECT '| ' || s.title || ' | ' || new.title || ' |' FROM project_board_sections s WHERE s.id = new.section_id)
    WHERE target_id = old.id AND type = 'item';

    -- Update child check items hierarchy to use this item's new title
    UPDATE search_index SET hierarchy = '| ' || new.title || ' | ' || title || ' |'
    WHERE type = 'check_item' AND target_id IN (SELECT id FROM project_board_check_items WHERE item_id = old.id);
END;
--> statement-breakpoint

-- CHECK ITEM: Just itself
CREATE TRIGGER check_items_au AFTER UPDATE ON project_board_check_items 
FOR EACH ROW WHEN old.title != new.title OR old.item_id != new.item_id BEGIN
    UPDATE search_index SET title = new.title,
        hierarchy = (SELECT '| ' || i.title || ' | ' || new.title || ' |' FROM project_board_items i WHERE i.id = new.item_id)
    WHERE target_id = old.id AND type = 'check_item';
END;
--> statement-breakpoint

-- ==========================================
-- 4. DELETE TRIGGERS
-- ==========================================

CREATE TRIGGER projects_ad AFTER DELETE ON projects BEGIN
    DELETE FROM search_index WHERE project_id = old.id;
END;
--> statement-breakpoint
CREATE TRIGGER documents_ad AFTER DELETE ON project_documents BEGIN
    DELETE FROM search_index WHERE target_id = old.id;
END;
--> statement-breakpoint
CREATE TRIGGER boards_ad AFTER DELETE ON project_boards BEGIN
    DELETE FROM search_index WHERE target_id = old.id;
END;
--> statement-breakpoint
CREATE TRIGGER sections_ad AFTER DELETE ON project_board_sections BEGIN
    DELETE FROM search_index WHERE target_id = old.id;
END;
--> statement-breakpoint
CREATE TRIGGER items_ad AFTER DELETE ON project_board_items BEGIN
    DELETE FROM search_index WHERE target_id = old.id;
END;
--> statement-breakpoint
CREATE TRIGGER check_items_ad AFTER DELETE ON project_board_check_items BEGIN
    DELETE FROM search_index WHERE target_id = old.id;
END;
